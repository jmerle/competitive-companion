(window as any).chrome = {
  runtime: {
    id: 'dev',
  },
};

import { parsers } from '../src/parsers/parsers';

for (const parser of parsers) {
  (window as any)[parser.constructor.name] = parser;
}

// This package has no types
// eslint-disable-next-line @typescript-eslint/naming-convention
const Nanobar = require('nanobar');
window.nanoBar = new Nanobar();
window.nanoBar.total = 0;
window.nanoBar.advance = () => {};
