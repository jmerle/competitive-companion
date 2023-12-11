// This makes it possible to import code that uses webextension-polyfill in Node.js
// See https://github.com/mozilla/webextension-polyfill/blob/0cf8915cb1cd4f7792e1f25f022905a1384ba969/src/browser-polyfill.js#L10
(globalThis as any).chrome = {
  runtime: {
    id: 'dev',
  },
};
