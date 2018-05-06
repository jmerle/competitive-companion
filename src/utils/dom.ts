// This package doesn't have types
const snarkdown = require('snarkdown').default;

export function htmlToElement(html: string): Element {
  return new DOMParser().parseFromString(html, 'text/html').body;
}

export function markdownToHtml(markdown: string): string {
  return snarkdown(markdown);
}
