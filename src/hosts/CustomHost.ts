import { Host } from './Host';

export class CustomHost extends Host {
  public constructor(private port: number) {
    super();
  }

  public async send(data: string): Promise<void> {
    await this.doSend(`http://localhost:${this.port}/`, {
      body: data,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    });
  }
}
