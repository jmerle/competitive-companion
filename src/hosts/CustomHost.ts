import { Host } from './Host';

export class CustomHost extends Host {
  public constructor(private port: number) {
    super();
  }

  public async send(data: string): Promise<void> {
    await this.doSend(`http://localhost:${this.port}/`, {
      body: data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
