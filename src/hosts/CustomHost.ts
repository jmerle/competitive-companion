import { Host } from './Host';

export class CustomHost implements Host {
  constructor(public port: number) {}

  public send(data: string): Promise<void> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `http://localhost:${this.port}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.timeout = 500;

      xhr.onload = () => resolve();
      xhr.ontimeout = () => resolve();
      xhr.onabort = () => resolve();
      xhr.onerror = () => resolve();

      try {
        xhr.send(data);
        xhr.send();
      } catch (err) {
        //
      }
    });
  }
}
