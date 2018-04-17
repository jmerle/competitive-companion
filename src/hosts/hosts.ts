import { Host } from './Host';
import { CHelperHost } from './CHelperHost';
import { Config } from '../utils/Config';
import { CustomHost } from './CustomHost';

const defaultHosts = [new CHelperHost()];

export function getHosts(): Promise<Host[]> {
  return new Promise((resolve, reject) => {
    Config.get<number[]>('customPorts', []).then(ports => {
      const hosts = defaultHosts.concat(ports.map(port => new CustomHost(port)));
      resolve(hosts);
    }).catch(reject);
  });
}
