import browser from 'webextension-polyfill';
import { MessageAction } from '../models/messaging';
import { noop } from './noop';

export function sendToBackground(action: MessageAction, payload: any = {}): void {
  browser.runtime.sendMessage({ action, payload }).then(noop).catch(noop);
}

export function sendToContent(tabId: number, action: MessageAction, payload: any = {}): void {
  browser.tabs.sendMessage(tabId, { action, payload }).then(noop).catch(noop);
}
