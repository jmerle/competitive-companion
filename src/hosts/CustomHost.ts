import { Host } from './Host';
import axios from 'axios';

export class CustomHost implements Host {
  constructor(public port: number) {
  }

  send(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      axios.post(`http://localhost:${this.port}/`, data, {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(() => resolve()).catch(reject);
    });
  }
}
