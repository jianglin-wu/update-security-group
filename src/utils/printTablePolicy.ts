import Grid from 'console-grid';

interface IColumnItem {
  Port: string;
  CidrBlock: string;
  Ipv6CidrBlock: string;
  Action: string;
  ModifyTime: string;
  PolicyDescription: string;
  Protocol: string;
  [key: string]: any;
}

type IDataSource = Partial<IColumnItem>[];

export default (dataSource: IDataSource) => {
  const grid = new Grid();
  const data = {
    option: {
      sortField: 'CidrBlock',
    },
    columns: [
      {
        id: 'Port',
        name: '端口',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'Protocol',
        name: '协议',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'Action',
        name: '类型',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'CidrBlock',
        name: 'IPv4',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'Ipv6CidrBlock',
        name: 'IPv6',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'ModifyTime',
        name: '修改日期',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'PolicyDescription',
        name: '规则描述',
        type: 'string',
        maxWidth: 60,
      },
    ],
    rows: dataSource,
  };
  grid.render(data);
};
