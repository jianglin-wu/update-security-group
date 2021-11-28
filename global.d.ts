/* eslint-disable no-unused-vars */
declare module 'stun' {
  export type stunRes = { getAddress: () => { address: string } };
  async function request(
    addr: string,
    options: { retries: number; timeout?: number },
  ): Promise<stunRes>;
  export default {
    request,
  };
}

declare module 'console-grid' {
  class Grid {
    render(data: any):void;
  }
  export default Grid;
}
