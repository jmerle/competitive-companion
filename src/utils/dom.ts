export function htmlToElement(html: string): Element {
  return new DOMParser().parseFromString(html, 'text/html').body;
}
