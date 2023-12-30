import snarkdown from 'snarkdown';

export function htmlToElement(html: string): Element {
  return new DOMParser().parseFromString(html, 'text/html').documentElement;
}

export function markdownToHtml(markdown: string): string {
  return snarkdown(markdown);
}

export function decodeHtml(html: string): string {
  return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
