import type { Browser } from 'webextension-polyfill';

export const browser: Browser =
  typeof (globalThis as any | undefined).browser !== 'undefined'
    ? (globalThis as any).browser
    : (globalThis as any).chrome;
