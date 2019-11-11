// This package doesn't have types
const snarkdown = require('snarkdown');

export function htmlToElement(html: string): Element {
  return new DOMParser().parseFromString(html, 'text/html').body;
}

export function markdownToHtml(markdown: string): string {
  if (snarkdown.default) {
    return snarkdown.default(markdown);
  }

  return snarkdown(markdown);
}

export function decodeHtml(html: string): string {
  return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
