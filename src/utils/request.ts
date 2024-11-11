import type { Runtime } from 'webextension-polyfill';
import { version } from '../../package.json';
import { Message, MessageAction } from '../models/messaging';
import { browser } from './browser';
import { sendToBackground } from './messaging';
import { uuidv4 } from './random';

// When the parser is requested on a URL starting with <key>, request permission for <value>
export const requiredPermissions: Record<string, string> = {
  'https://codingcompetitions.withgoogle.com/': 'https://codejam.googleapis.com/dashboard/get_file/*',
  'https://tlx.toki.id/': 'https://api.tlx.toki.id/v2/*',
  'https://judge.beecrowd.com/': 'https://resources.beecrowd.com/*',
};

const defaultHeaders = {
  'X-Competitive-Companion': version,
} as const;

/**
 * Fetches a URL using a GET request and resolves into the HTML body.
 */
export async function request(url: string, options: RequestInit = {}, retries: number = 3): Promise<string> {
  options.headers = { ...defaultHeaders, ...options.headers };
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
 * This requires the URL's hostname to be whitelisted in the requiredPermissions variable above.
 */
export async function requestInBackground(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const messageId = uuidv4();

    const handleMessage = async (message: Message | any, sender: Runtime.MessageSender): Promise<void> => {
      if (sender.tab) {
        return;
      }

      if (message.action === MessageAction.FetchResult && message.payload.messageId === messageId) {
        browser.runtime.onMessage.removeListener(handleMessage);
        resolve(message.payload.content);
      } else if (message.action === MessageAction.FetchFailed && message.payload.messageId === messageId) {
        browser.runtime.onMessage.removeListener(handleMessage);
        reject(new Error(message.payload.message));
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);

    sendToBackground(MessageAction.Fetch, {
      messageId,
      url,
      options,
      retries,
    });
  });
}
