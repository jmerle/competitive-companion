import { config } from '../utils/config';
import { CHelperHost } from './CHelperHost';
import { CustomHost } from './CustomHost';
import { Host } from './Host';

const defaultHosts: Host[] = [new CHelperHost()];
const defaultPorts = [
  4244, // Hightail
  6174, // Mind Sport
  10042, // acmX
  10043, // Caide
  10045, // CP Editor
  27121, // Competitive Programming Helper
];

export async function getHosts(): Promise<Host[]> {
  const customPorts = await config.get('customPorts');
  const uniquePorts = [...new Set(defaultPorts.concat(customPorts))];
  return defaultHosts.concat(uniquePorts.map(port => new CustomHost(port)));
}
