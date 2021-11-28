import Grid from 'console-grid';

interface IColumnItem {
  SecurityGroupId: string;
  SecurityGroupName: string;
  SecurityGroupDesc: string;
  CreatedTime: string;
  UpdateTime: string;
  [key: string]: any;
}

type IDataSource = Partial<IColumnItem>[];

export default (dataSource: IDataSource) => {
  const grid = new Grid();
  const data = {
    option: {
      sortField: 'name',
    },
    columns: [
      {
        id: 'SecurityGroupId',
        name: 'ID',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'SecurityGroupName',
        name: '安全组名称',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'CreatedTime',
        name: '创建日期',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'UpdateTime',
        name: '更新日期',
        type: 'string',
        maxWidth: 20,
      },
      {
        id: 'SecurityGroupDesc',
        name: '安全组描述',
        type: 'string',
        maxWidth: 60,
      },
    ],
    rows: dataSource,
  };
  grid.render(data);
};
