import { Host } from './Host';

export class CustomHost extends Host {
  public constructor(
    private host: string,
    private port: number,
  ) {
    super();
  }

  public async send(data: string): Promise<void> {
    await this.doSend(`http://${this.host}:${this.port}/`, {
      body: data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
