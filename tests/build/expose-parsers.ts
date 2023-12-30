// @ts-expect-error There are no types for this import
import Nanobar from 'nanobar';
import { parsers } from '../../src/parsers/parsers';

for (const parser of parsers) {
  (window as any)[parser.constructor.name] = parser;
}

window.nanoBar = new Nanobar();
window.nanoBar.total = 0;
window.nanoBar.advance = () => {};
