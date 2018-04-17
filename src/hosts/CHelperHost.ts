import { Host } from './Host';
import axios from 'axios';

export class CHelperHost implements Host {
  send(data: string): Promise<void> {
    return new Promise(resolve => {
      const message = 'json\n' + data;

      axios.post('http://localhost:4243', message, {
        timeout: 500,
      }).catch(resolve);
    });
  }
}
