import browser, { Runtime } from 'webextension-polyfill';
import { Message, MessageAction } from '../models/messaging';
import { sendToBackground } from './messaging';
import { uuidv4 } from './random';

/**
 * Fetches a URL using a GET request and resolves into the HTML body.
 */
export async function request(url: string, options: RequestInit = {}, retries: number = 3): Promise<string> {
  const response = await fetch(url, { credentials: 'include', ...options });

  if (response.ok && response.status === 200) {
    return response.text();
  }

  if (retries > 0) {
    // Some judges don't like it if we send 10+ parallel requests when parsing all problems in a contest
    // By delaying retries we get around any short-term rate limits
    await new Promise(resolve => setTimeout(resolve, 2000 - 500 * retries));

    return request(url, options, retries - 1);
  }

  throw new Error(`The network response was not ok (status code: ${response.status}, url: ${url}).`);
}

/**
 * Fetches a URL in the background script using a GET request and resolves into the HTML body.
 * This requires the URL's hostname to be whitelisted in the optional_permissions array in static/manifest.json and in
 * the requiredPermissions variable in src/background.ts.
 */
export async function requestInBackground(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const requestId = uuidv4();

    const handleMessage = (message: Message, sender: Runtime.MessageSender): void => {
      if (sender.tab) {
        return;
      }

      if (message.action === MessageAction.FetchResult && message.payload.requestId === requestId) {
        browser.runtime.onMessage.removeListener(handleMessage);
        resolve(message.payload.content);
      } else if (message.action === MessageAction.FetchFailed && message.payload.requestId === requestId) {
        browser.runtime.onMessage.removeListener(handleMessage);
        reject(new Error(message.payload.message));
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);

    sendToBackground(MessageAction.Fetch, {
      requestId,
      url,
      options,
      retries,
    });
  });
}
