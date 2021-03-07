import { config } from '../utils/config';
import { Host } from './Host';

export class CustomHost implements Host {
  public constructor(private port: number) {}

  public async send(data: string): Promise<void> {
    const requestTimeout = await config.get('requestTimeout');

    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `http://localhost:${this.port}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.timeout = requestTimeout;

      xhr.onload = (): void => resolve();
      xhr.ontimeout = (): void => resolve();
      xhr.onabort = (): void => resolve();
      xhr.onerror = (): void => resolve();

      try {
        xhr.send(data);
        xhr.send();
      } catch (err) {
        //
      }
    });
  }
}
