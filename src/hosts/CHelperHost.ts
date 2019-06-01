import { Host } from './Host';

export class CHelperHost implements Host {
  public send(data: string): Promise<void> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:4243/', true);

      xhr.timeout = 50000;

      xhr.onload = () => resolve();
      xhr.ontimeout = () => resolve();
      xhr.onabort = () => resolve();
      xhr.onerror = () => resolve();

      xhr.upload.onprogress = ev => {
        if (ev.loaded === ev.total) {
          xhr.abort();
          resolve();
        }
      };

      try {
        xhr.send('json\n' + data);
        xhr.send();
      } catch (err) {
        //
      }
    });
  }
}
