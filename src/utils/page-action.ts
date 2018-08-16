import { sendToBackground } from './messaging';
import { MessageAction } from '../models/messaging';

function isContentScript(): boolean {
  return (window as any).isContentScript === true;
}

export function enablePageAction(tabId?: number) {
  if (isContentScript()) {
    sendToBackground(MessageAction.EnablePageAction);
  } else {
    browser.pageAction.show(tabId);
  }
}

export function disablePageAction(tabId?: number) {
  if (isContentScript()) {
    sendToBackground(MessageAction.DisablePageAction);
  } else {
    browser.pageAction.hide(tabId);
  }
}
