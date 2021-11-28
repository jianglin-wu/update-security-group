import { cosmiconfigSync } from 'cosmiconfig';
import * as Joi from '@hapi/joi';
import 'joi-extract-type';

const cliName = 'secgroup';

const schema = Joi.object().keys({
  secret: Joi.object()
    .keys({
      secretId: Joi.string().required().description('腾讯云 secret ID'),
      secretKey: Joi.string().required().description('腾讯云 secret Key'),
    })
    .required(),
  options: Joi.object()
    .keys({
      spacePrefix: Joi.string()
        .default('auto-tools')
        .description('区分自动化工具的规则描述前缀'),
      region: Joi.string()
        .default('ap-shanghai')
        .required()
        .description('指定区域'),
      securityGroupId: Joi.string().required().description('指定安全组标识'),
    })
    .required(),
  wanIngres: Joi.array()
    .items(
      Joi.object({
        Port: Joi.string().required().description('指定端口'),
        PolicyDescription: Joi.string().required().description('指定描述'),
      }).required(),
    )
    .description('指定允许当前网络的安全规则'),
});

export type IConfig = Joi.extractType<typeof schema>;

export default (): IConfig => {
  const explorerSync = cosmiconfigSync(cliName);
  const { config } = explorerSync.search() || {};
  if (!config) {
    throw Error('缺少配置');
  }
  const { error, value } = schema.validate<IConfig>(config, {
    abortEarly: false,
  });
  if (error) {
    (Error as any).stackTraceLimit = 0;
    const errMsg = error.details.map(({ message }) => message).join('\n');
    throw Error(`配置错误：\n${errMsg}`);
  }
  return value;
};
