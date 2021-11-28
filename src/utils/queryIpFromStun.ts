import stun, { stunRes } from 'stun';

type StunHosts = Array<{ addr: string }>;

const defaultHosts: StunHosts = [
  { addr: 'stun.callwithus.com' },
  { addr: 'stun.counterpath.net' },
  { addr: 'stun.internetcalls.com' },
  { addr: 'stun.sipgate.net' },
  { addr: 'stun.stunprotocol.org' },
  { addr: 'stun.voip.aebc.com' },
  { addr: 'stun.voipbuster.com' },
  { addr: 'stun.voxgratia.org' },
  { addr: 'stun.xten.com' },
];

export default async (hosts: StunHosts = defaultHosts): Promise<string> => {
  let res: stunRes | undefined;
  let index: number = 0;
  while (index < hosts.length) {
    // eslint-disable-next-line no-plusplus
    const { addr } = hosts[index++];
    try {
      // eslint-disable-next-line no-await-in-loop
      res = await stun.request(addr, {
        retries: 1,
      });
      break;
    } catch (err) {
      console.log('[fetchPublicIp] silence err', addr, err);
    }
  }
  if (!res) {
    throw Error('[fetchPublicIp] Fail');
  }
  return res.getAddress().address;
};
