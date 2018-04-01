import { MessageAction } from './models/messaging';
import * as Noty from 'noty';
import { Type } from 'noty';

let id: number;

export function init(tabId: number) {
  id = tabId;
}

/**
 * Enables the parse button for this tab.
 */
export function enableParsing() {
  browser.runtime.sendMessage({
    action: MessageAction.EnableParsing,
    payload: {
      tabId: id,
    },
  });
}

/**
 * Disables the parse button for this tab.
 */
export function disableParsing() {
  browser.runtime.sendMessage({
    action: MessageAction.DisableParsing,
    payload: {
      tabId: id,
    },
  });
}

export function notify(message: string, type: Type, timeout: number = 5000) {
  new Noty({
    type: type,
    layout: 'bottomRight',
    theme: 'metroui',
    text: '<b>CHelper Companion</b><br>' + message,
    timeout: timeout,
  }).show();
}

export const NotificationType = {
  Alert: 'alert',
  Success: 'success',
  Error: 'error',
  Warning: 'warning',
  Info: 'info',
};
