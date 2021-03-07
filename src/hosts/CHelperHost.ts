import { config } from '../utils/config';
import { Host } from './Host';

export class CHelperHost implements Host {
  public async send(data: string): Promise<void> {
    const requestTimeout = await config.get('requestTimeout');

    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:4243/', true);

      xhr.timeout = requestTimeout;

      xhr.onload = (): void => resolve();
      xhr.ontimeout = (): void => resolve();
      xhr.onabort = (): void => resolve();
      xhr.onerror = (): void => resolve();

      try {
        xhr.send('json\n' + data);
        xhr.send();
      } catch (err) {
        //
      }
    });
  }
}
