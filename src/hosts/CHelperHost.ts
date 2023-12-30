import { Host } from './Host';

export class CHelperHost extends Host {
  public async send(data: string): Promise<void> {
    await this.doSend('http://localhost:4243/', {
      body: `json\n${data}`,
    });
  }
}
