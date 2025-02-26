// @ts-expect-error There are no types for this import
import Nanobar from 'nanobar';
import type { Runtime } from 'webextension-polyfill';
import { Message, MessageAction } from './models/messaging';
import { Reporter } from './models/TaskBuilder';
import { Parser } from './parsers/Parser';
import { parsers } from './parsers/parsers';
import { browser } from './utils/browser';
import { config } from './utils/config';
import { noop } from './utils/noop';

declare global {
  interface Window {
    nanoBar: {
      total: number;
      go(percentage: number): void;
      advance(delta: number): void;
    };
  }
}

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
  // ESBuild prefixes classes with an underscore when they have one or more static members
  const prefixedName = '_' + name;
  return parsers.find(parser => parser.constructor.name === name || parser.constructor.name === prefixedName);
}

async function parse(parser: Parser): Promise<void> {
  const bar = new Nanobar();
  window.nanoBar = bar;

  bar.total = 0;
  bar.advance = (delta: number) => {
    bar.total += delta;

    if (Math.abs(100 - bar.total) < 1e-6) {
      bar.total = 100;
    }

    bar.go(bar.total);
  };

  const styleTag = document.querySelector('#nanobarcss');
  styleTag.textContent = styleTag.textContent.replace('#000', '#3498db');

  try {
    const sendable = await parser.parse(window.location.href, document.documentElement.outerHTML);
    await sendable.send();
  } catch (err) {
    console.error(err);

    if (err instanceof Reporter) {
      alert(err.message);
    } else {
      alert(
        [
          `Something went wrong while running Competitive Companion Customized's ${parser.constructor.name}.`,
          'Open the browser console to see the error.',
          'Please open an issue at https://github.com/lnw143/competitive-companion-customized/issues if you think this is a bug (make sure to include a link to this page).',
        ].join(' '),
      );
    }
  }

  if (bar.total < 100) {
    bar.advance(100 - bar.total);
  }
}

async function handleMessage(message: Message | any, sender: Runtime.MessageSender): Promise<void> {
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
              'Competitive Companion Customized By lnw143 could not determine which parser to parse this page with.',
              'Please right-click on the plus icon and select the parser to use via the "Parse with" context menu.',
              'Please open an issue at https://github.com/lnw143/competitive-companion-customized/issues if you think this is a bug (make sure to include a link to this page).',
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
