// 安全组 API: https://cloud.tencent.com/document/product/213/12447
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/vpc/v20170312/vpc_client';
import * as R from 'ramda';
import fetchPublicIp from './utils/queryIpFromStun';
import getConfig, { IConfig } from './config';

const VpcClient = tencentcloud.vpc.v20170312.Client;

interface IIngres {
  Port: string;
  CidrBlock?: string;
  Ipv6CidrBlock?: string;
  PolicyDescription: string;
  Action: string;
  Protocol: string;
}

type ISecret = IConfig['secret'];
type IOptions = IConfig['options'];
type IWanIngres = IConfig['wanIngres'];
type IRules = Record<'wanIngres', IWanIngres>;

class SecurityGroup {
  public options: IOptions;

  public rules: IRules;

  public client: Client;

  constructor(secret: ISecret, options: IOptions, rules: IRules) {
    this.options = options;
    this.rules = rules;
    this.client = new VpcClient({
      credential: secret,
      region: options.region,
      profile: {
        httpProfile: {
          endpoint: 'vpc.tencentcloudapi.com',
        },
      },
    });
  }

  // 获取已存在的手动配置的规则
  async queryExistingManual(securityGroupId: string) {
    const { spacePrefix } = this.options;
    const policiesResult = await this.describeSecurityGroupPolicies(securityGroupId);
    const ingress: IIngres[] = R.pathOr([], ['Ingress'], policiesResult) as IIngres[];
    const newIngress: IIngres[] = ingress
      .filter(
        ({ PolicyDescription = '' }) => !RegExp(`^\\[${spacePrefix}\\]`).test(PolicyDescription),
      )
      .map(
        R.pick(['Port', 'CidrBlock', 'Ipv6CidrBlock', 'PolicyDescription', 'Action', 'Protocol']),
      );
    return newIngress.map((item) => {
      const { CidrBlock, Ipv6CidrBlock, ...rest } = item;
      const newItem: IIngres = { ...rest };
      if (CidrBlock) {
        newItem.CidrBlock = CidrBlock;
      }
      if (Ipv6CidrBlock) {
        newItem.Ipv6CidrBlock = Ipv6CidrBlock;
      }
      return newItem;
    });
  }

  // 设置当前公网 ip 到规则
  async setupWanIngres() {
    const { securityGroupId, spacePrefix } = this.options;
    const { wanIngres } = this.rules;
    if (!wanIngres) {
      throw Error('缺少 wanIngres 配置');
    }

    const publicIp = await fetchPublicIp();
    const existingIngress = await this.queryExistingManual(securityGroupId);
    const newIngress: IIngres[] = ([] as IIngres[]).concat(
      existingIngress,
      wanIngres?.map((item) => ({
        CidrBlock: publicIp,
        Action: 'ACCEPT',
        Protocol: 'tcp',
        ...item,
        PolicyDescription: `[${spacePrefix}] ${item.PolicyDescription}`,
      })),
    );
    await this.setSecurityGroupPolicies(
      securityGroupId,
      newIngress,
    );
    return this.describeSecurityGroupPolicies(securityGroupId);
  }

  // 清除自动化工具的设置
  async unsetWanIngres() {
    const { securityGroupId } = this.options;
    const newIngress: IIngres[] = await this.queryExistingManual(securityGroupId);
    await this.setSecurityGroupPolicies(securityGroupId, newIngress);
    return this.describeSecurityGroupPolicies(securityGroupId);
  }

  // 查看安全组
  async describeSecurityGroups() {
    const result = await this.client.DescribeSecurityGroups({});
    return result.SecurityGroupSet;
  }

  // 查询安全组规则
  async describeSecurityGroupPolicies(securityGroupId: string) {
    const result = await this.client.DescribeSecurityGroupPolicies({
      SecurityGroupId: securityGroupId,
    });
    return result.SecurityGroupPolicySet;
  }

  // 设置安全组规则
  async setSecurityGroupPolicies(securityGroupId: string, Ingress: IIngres[]) {
    const params = {
      SecurityGroupId: securityGroupId,
      SecurityGroupPolicySet: {
        Ingress,
      },
    };
    return this.client.ModifySecurityGroupPolicies(params);
  }
}

export const setup = () => {
  const { secret, options, wanIngres } = getConfig();
  return new SecurityGroup(secret, options, { wanIngres });
};

export default SecurityGroup;
