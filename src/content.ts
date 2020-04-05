import { browser, Runtime } from 'webextension-polyfill-ts';
import { Message, MessageAction } from './models/messaging';
import { Parser } from './parsers/Parser';
import { parsers } from './parsers/parsers';
import { noop } from './utils/noop';

// This package has no types
const Nanobar = require('nanobar');

(window as any).isContentScript = true;

function getParserToUse(): Parser {
  const url = window.location.href;

  for (const parser of parsers) {
    const hasMatchingPattern = parser.getRegularExpressions().some(r => r.test(url));
    const hasMatchingExcludedPattern = parser.getExcludedRegularExpressions().some(r => r.test(url));

    if (hasMatchingPattern && !hasMatchingExcludedPattern && parser.canHandlePage()) {
      return parser;
    }
  }
}

function getParserByName(name: string): Parser {
  return parsers.find(parser => parser.constructor.name === name);
}

async function parse(parser: Parser): Promise<void> {
  (window as any).nanoBar = new Nanobar();

  document.querySelectorAll('.bar').forEach(bar => {
    (bar as HTMLElement).style.backgroundColor = '#3498db';
  });

  try {
    const sendable = await parser.parse(window.location.href, document.body.innerHTML);
    await sendable.send();
  } catch (err) {
    // tslint:disable-next-line no-console
    console.error(err);
  }

  (window as any).nanoBar.go(100);
}

function handleMessage(message: Message | any, sender: Runtime.MessageSender): void {
  if (sender.tab) {
    return;
  }

  if (message.action === MessageAction.Parse) {
    const parserName = message.payload.parserName;

    if (parserName === null) {
      const parser = getParserToUse();

      parse(parser).then(noop).catch(noop);
    } else {
      parse(getParserByName(parserName)).then(noop).catch(noop);
    }
  }
}

browser.runtime.onMessage.addListener(handleMessage);
