import { Host } from './Host';

export class CHelperHost implements Host {
  public send(data: string): Promise<void> {
    return new Promise(resolve => {
      const message = 'json\n' + data;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:4243/', true);

      xhr.timeout = 500;
      xhr.onload = () => resolve();
      xhr.ontimeout = () => resolve();

      xhr.send(message);
      xhr.send();
    });
  }
}
