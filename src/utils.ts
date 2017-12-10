import {MessageAction} from "./models/messaging";

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
