import commander from 'commander';
import appConfig from '../package.json';
import { setup } from './index';
import renderGroups from './utils/printTableGroup';
import renderPolicy from './utils/printTablePolicy';

const { Command } = commander;

const program = new Command();
program.version(appConfig.version || '0.0.0', '-v, --version', '输出版本号');

program
  .command('groups')
  .description('查看安全组列表')
  .action(async () => {
    try {
      const app = setup();
      const data = await app.describeSecurityGroups();
      renderGroups(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('查看安全组列表表失败：', error);
    }
  });

program
  .command('policies <id>')
  .description('查看安全组规则')
  .action(async (id) => {
    try {
      const app = setup();
      const securityGroupId = id || app.options.securityGroupId;
      const data = await app.describeSecurityGroupPolicies(securityGroupId);
      if (data?.Ingress) {
        // eslint-disable-next-line no-console
        console.log('入站规则：');
        renderPolicy(data.Ingress);
      }
      if (data?.Egress) {
        // eslint-disable-next-line no-console
        console.log('出站规则：');
        renderPolicy(data.Egress);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('查看安全组规则失败：', error);
    }
  });

program
  .command('update')
  .option('-d, --daemon', '进程后台方式运行')
  .description('更新安全组规则')
  .action(async () => {
    try {
      const app = setup();
      const data = await app.setupWanIngres();
      if (data?.Ingress) {
        // eslint-disable-next-line no-console
        console.log('入站规则：');
        renderPolicy(data.Ingress);
      }
      if (data?.Egress) {
        // eslint-disable-next-line no-console
        console.log('出站规则：');
        renderPolicy(data.Egress);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('更新安全组规则失败：', error);
    }
  });

program
  .command('clean')
  .description('清除安全组自动规则')
  .action(async () => {
    try {
      const app = setup();
      const data = await app.unsetWanIngres();
      if (data?.Ingress) {
        // eslint-disable-next-line no-console
        console.log('入站规则：');
        renderPolicy(data.Ingress);
      }
      if (data?.Egress) {
        // eslint-disable-next-line no-console
        console.log('出站规则：');
        renderPolicy(data.Egress);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('清除安全组自动规则失败：', error);
    }
  });

program.parse(process.argv);
