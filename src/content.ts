import { Parser } from './parsers/Parser';
import { parsers } from './parsers/parsers';

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

(async () => {
  const parser = getParserToUse();

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
})();
