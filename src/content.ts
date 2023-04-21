import browser, { Runtime } from 'webextension-polyfill';
import { Message, MessageAction } from './models/messaging';
import { Parser } from './parsers/Parser';
import { parsers } from './parsers/parsers';
import { config } from './utils/config';
import { noop } from './utils/noop';

// This package has no types
// eslint-disable-next-line @typescript-eslint/naming-convention
const Nanobar = require('nanobar');

(window as any).isContentScript = true;

async function getParserToUse(): Promise<Parser> {
  const url = window.location.href;

  const customRules = await config.get('customRules');
  for (const [expression, parserName] of customRules) {
    const pattern = new RegExp(expression);

    if (pattern.test(url)) {
      return getParserByName(parserName);
    }
  }

  for (const parser of parsers) {
    const hasMatchingPattern = parser.getRegularExpressions().some(r => r.test(url));
    const hasMatchingExcludedPattern = parser.getExcludedRegularExpressions().some(r => r.test(url));

    if (hasMatchingPattern && !hasMatchingExcludedPattern && parser.canHandlePage()) {
      return parser;
    }
  }

  return null;
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
    const sendable = await parser.parse(window.location.href, document.documentElement.outerHTML);
    await sendable.send();
  } catch (err) {
    console.error(err);

    alert(
      [
        `Something went wrong while running Competitive Companion's ${parser.constructor.name}.`,
        'Open the browser console to see the error.',
        'Please open an issue at https://github.com/jmerle/competitive-companion/issues if you think this is a bug (make sure to include a link to this page).',
      ].join(' '),
    );
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
      getParserToUse().then(parser => {
        if (parser === null) {
          alert(
            [
              'Competitive Companion could not determine which parser to parse this page with.',
              'Please right-click on the plus icon and select the parser to use via the "Parse with" context menu.',
              'Please open an issue at https://github.com/jmerle/competitive-companion/issues if you think this is a bug (make sure to include a link to this page).',
            ].join(' '),
          );
          return;
        }

        parse(parser).then(noop).catch(noop);
      });
    } else {
      parse(getParserByName(parserName)).then(noop).catch(noop);
    }
  }

  browser.runtime.onMessage.removeListener(handleMessage);
}

browser.runtime.onMessage.addListener(handleMessage);
