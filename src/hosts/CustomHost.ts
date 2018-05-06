import { Host } from './Host';

export class CustomHost implements Host {
  constructor(public port: number) {
  }

  send(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `http://localhost:${this.port}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.timeout = 500;
      xhr.ontimeout = () => reject();
      xhr.onload = () => resolve();

      xhr.send(data);
      xhr.send(null);
    });
  }
}
