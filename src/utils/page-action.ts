import { sendToBackground } from './messaging';
import { MessageAction } from '../models/messaging';

declare global {
  const chrome: any;
}

function isContentScript(): boolean {
  return (window as any).isContentScript === true;
}

function isChrome(): boolean {
  return window.navigator.userAgent.toLowerCase().includes('chrome');
}

export function enablePageAction(tabId?: number) {
  if (isContentScript()) {
    sendToBackground(MessageAction.EnablePageAction);
  } else {
    (isChrome() ? chrome : browser).pageAction.show(tabId);
  }
}

export function disablePageAction(tabId?: number) {
  if (isContentScript()) {
    sendToBackground(MessageAction.DisablePageAction);
  } else {
    (isChrome() ? chrome : browser).pageAction.hide(tabId);
  }
}
