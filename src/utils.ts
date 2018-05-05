import { MessageAction } from './models/messaging';
import { Converter } from 'showdown';

let id: number;
let markdownConverter: Converter = null;

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

export function htmlToElement(html: string): Element {
  return new DOMParser().parseFromString(html, 'text/html').body;
}

export function markdownToHtml(markdown: string): string {
  if (markdownConverter === null) {
    markdownConverter = new Converter();
  }

  return markdownConverter.makeHtml(markdown);
}
