import { Host } from './Host';

export class CustomHost implements Host {
  public constructor(public port: number) {}

  public send(data: string): Promise<void> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `http://localhost:${this.port}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.timeout = 500;

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
