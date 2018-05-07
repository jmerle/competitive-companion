import { Host } from './Host';
import { CHelperHost } from './CHelperHost';
import { Config } from '../utils/Config';
import { CustomHost } from './CustomHost';

const defaultHosts: Host[] = [new CHelperHost()];
const defaultPorts = [
  4244, // Hightail
  6174, // Mind Sport
];

export function getHosts(): Promise<Host[]> {
  return new Promise((resolve, reject) => {
    Config.get<number[]>('customPorts').then(ports => {
      const uniquePorts = [...new Set(defaultPorts.concat(ports))];
      const hosts = defaultHosts.concat(uniquePorts.map(port => new CustomHost(port)));
      resolve(hosts);
    }).catch(reject);
  });
}
