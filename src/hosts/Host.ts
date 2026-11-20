import { getRequestTimeout } from '../utils/config';

export abstract class Host {
  public abstract send(data: string): Promise<void>;

  protected async doSend(url: string, options: RequestInit): Promise<void> {
    const requestTimeout = await getRequestTimeout(500);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), requestTimeout);

    try {
      await fetch(url, {
        method: 'POST',
        ...options,
        signal: abortController.signal,
      });
    } catch (err) {
      //
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
