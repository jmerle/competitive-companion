import { Message, MessageAction } from "./models/messaging";
import Parser from "./parsers/Parser";
import parsers from "./parsers/parsers";
import * as NProgress from 'nprogress';
import { disableParsing, enableParsing, init } from "./utils";
import * as Noty from 'noty';

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

    new Noty({
      type: 'error',
      layout: 'bottomRight',
      theme: 'metroui',
      text: '<b>CHelper Companion</b><br>Something went wrong while retrieving the problems. Please try again.',
      timeout: 5000,
    }).show();
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
