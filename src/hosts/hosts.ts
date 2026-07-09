import { config } from '../utils/config';
import { CHelperHost } from './CHelperHost';
import { CustomHost } from './CustomHost';
import { Host } from './Host';

const defaultHosts = ['localhost'];
const defaultPorts = [
  1327, // cpbooster
  4244, // Hightail
  6174, // Mind Sport
  10042, // acmX
  10043, // Caide and AI Virtual Assistant
  10045, // CP Editor
  27121, // Competitive Programming Helper
];

export async function getHosts(): Promise<Host[]> {
  const customHosts = await config.get('customHosts');
  const uniqueHosts = [...new Set(defaultHosts.concat(customHosts))];

  const customPorts = await config.get('customPorts');
  const uniquePorts = [...new Set(defaultPorts.concat(customPorts))];

  const hosts: Host[] = [new CHelperHost()];
  uniqueHosts.map(host => {
    uniquePorts.map(port => {
      hosts.push(new CustomHost(host, port));
    });
  });

  return hosts;
}
