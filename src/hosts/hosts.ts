import { Config } from '../utils/Config';
import { CHelperHost } from './CHelperHost';
import { CustomHost } from './CustomHost';
import { Host } from './Host';

const defaultHosts: Host[] = [new CHelperHost()];
const defaultPorts = [
  4244, // Hightail
  6174, // Mind Sport
];

export function getHosts(): Promise<Host[]> {
  return new Promise((resolve, reject) => {
    Config.get<number[]>('customPorts')
      .then(ports => {
        const uniquePorts = [...new Set(defaultPorts.concat(ports))];
        const hosts = defaultHosts.concat(
          uniquePorts.map(port => new CustomHost(port)),
        );
        resolve(hosts);
      })
      .catch(reject);
  });
}
