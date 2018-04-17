import { Message, MessageAction } from './models/messaging';
import { Parser } from './parsers/Parser';
import { parsers } from './parsers/parsers';
import { disablePageAction, enablePageAction } from './utils/page-action';

// This package has no types
const Nanobar = require('nanobar');

(window as any).isContentScript = true;

let activeParser: Parser = null;

function checkTab(tabId: number, url: string): void {
  for (let i = 0; i < parsers.length; i++) {
    const parser = parsers[i];

    const hasMatchingPattern = parser
      .getRegularExpressions()
      .some(r => r.test(url));

    if (hasMatchingPattern && parser.canHandlePage()) {
      activeParser = parser;
      activeParser.load();
      break;
    }
  }
}

async function parse() {
  disablePageAction();
  (window as any).nanoBar = new Nanobar();

  document.querySelectorAll('.bar').forEach(bar => {
    (bar as HTMLElement).style.backgroundColor = '#3498db';
  });

  try {
    const sendable = await activeParser.parse(window.location.href, document.body.innerHTML);
    (window as any).nanoBar.go(100);
    await sendable.send();
  } catch (err) {
    console.error(err);
  }

  enablePageAction();
}

function handleMessage(message: Message, sender: browser.runtime.MessageSender) {
  if (sender.tab) return;

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
