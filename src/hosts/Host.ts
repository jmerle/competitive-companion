import { config } from '../utils/config';

export abstract class Host {
  public abstract send(data: string): Promise<void>;

  protected async doSend(url: string, options: RequestInit): Promise<void> {
    const requestTimeout = await config.get('requestTimeout');

    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), requestTimeout);

    try {
      await fetch(url, {
        method: 'POST',
        signal: abortController.signal,
        mode: 'no-cors',
        ...options,
      });
    } catch (err) {
      //
    }
  }
}
