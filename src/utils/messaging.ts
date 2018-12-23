import { MessageAction } from '../models/messaging';

export function sendToBackground(action: MessageAction, payload: any = {}) {
  browser.runtime
    .sendMessage({ action, payload })
    .then(() => {})
    .catch(() => {});
}

export function sendToContent(tabId: number, action: MessageAction, payload: any = {}) {
  browser.tabs
    .sendMessage(tabId, { action, payload })
    .then(() => {})
    .catch(() => {});
}
