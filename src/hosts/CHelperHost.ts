import { Host } from './Host';

export class CHelperHost implements Host {
  public send(data: string): Promise<void> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:4243/', true);

      xhr.timeout = 500;

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
