import { Message, MessageAction } from './models/messaging';
import { Parser } from './parsers/Parser';
import { parsers } from './parsers/parsers';
import { sendToBackground } from './utils/messaging';

// This package has no types
const Nanobar = require('nanobar');

(window as any).isContentScript = true;

let activeParser: Parser = null;

function checkTab(tabId: number, url: string): void {
  for (const parser of parsers) {
    const hasMatchingPattern = parser
      .getRegularExpressions()
      .some(r => r.test(url));

    if (hasMatchingPattern && parser.canHandlePage()) {
      activeParser = parser;
      sendToBackground(MessageAction.EnablePageAction);
      break;
    }
  }
}

async function parse() {
  sendToBackground(MessageAction.DisablePageAction);
  (window as any).nanoBar = new Nanobar();

  document.querySelectorAll('.bar').forEach(bar => {
    (bar as HTMLElement).style.backgroundColor = '#3498db';
  });

  try {
    const sendable = await activeParser.parse(
      window.location.href,
      document.body.innerHTML,
    );
    (window as any).nanoBar.go(100);
    await sendable.send();
  } catch (err) {
    // tslint:disable-next-line no-console
    console.error(err);
  }

  sendToBackground(MessageAction.EnablePageAction);
}

function handleMessage(
  message: Message | any,
  sender: browser.runtime.MessageSender,
  sendResponse: (response: object) => Promise<void>,
) {
  if (sender.tab) {
    return;
  }

  switch (message.action) {
    case MessageAction.CheckTab:
      checkTab(message.payload.tabId, message.payload.url);
      break;
    case MessageAction.Parse:
      parse();
      break;
  }
}

browser.runtime.onMessage.addListener(handleMessage);
