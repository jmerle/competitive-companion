import { Message, MessageAction } from './models/messaging';
import { Parser } from './parsers/Parser';
import { parsers } from './parsers/parsers';
import * as NProgress from 'nprogress';
import { init, disableParsing, enableParsing, notify } from './utils';

NProgress.configure({
  trickle: false,
});

let activeParser: Parser = null;

function checkTab(tabId: number, url: string): void {
  init(tabId);

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
  disableParsing();
  NProgress.start();

  try {
    const sendable = await activeParser.parse(document.body.innerHTML);
    await sendable.send();
  } catch (err) {
    console.error(err);
    notify('Something went wrong while retrieving the problems. Please try again.', 'error');
  }

  NProgress.done();
  enableParsing();
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
