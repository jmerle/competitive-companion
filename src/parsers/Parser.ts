import { enableParsing } from '../utils';
import { matchPatternToRegExp } from '../vendor/match-pattern-to-reg-exp';
import { Sendable } from '../models/Sendable';



export abstract class Parser {
  /**
   * Returns the match patterns which this problemParser can handle. These are the
   * patterns that are used for the matches key of the content script in the manifest.
   * More information about match patterns: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns
   */
  abstract getMatchPatterns(): string[];

  /**
   * Returns the match patterns which this problemParser can't handle. These are the
   * patterns that are used for the exclude_matches key of the content script in the manifest.
   */
  getExcludedMatchPatterns(): string[] {
    return [];
  }

  /**
   * Returns the regular expressions which this problemParser can handle. These are
   * used to check whether a page can be handled by this problemParser, and allow for more
   * specific rules than getMatchPatterns, which is used because the extension manifest
   * does not allow regular expressions.
   */
  getRegularExpressions(): RegExp[] {
    return this.getMatchPatterns().map(matchPatternToRegExp);
  }

  /**
   * When one of the regular expressions of this problemParser match the current url, this method is called.
   * If it returns true, it is assumed this page can load this page. This is useful for contest
   * parsers where the url might not give away whether the contest problems are already available.
   */
  canHandlePage(): boolean {
    return true;
  }

  /**
   * When both a match pattern matches and canHandlePage returns true, this method is called.
   * By default, it automatically enables the ability to parse the page.
   */
  load(): void {
    enableParsing();
  }

  /**
   * The method called when the parse button is clicked.
   * If it rejects, an notify will be shown to the user.
   */
  abstract parse(url: string, html: string): Promise<Sendable>;

  /**
   * Fetches a url using a GET request and resolves into the HTML body.
   */
  protected fetch(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(url, { redirect: 'manual', credentials: 'include' })
        .then(response => {
          if (response.ok && response.status === 200) {
            return response.text();
          }

          throw new Error(`The network response was not ok (status code: ${response.status}).`);
        })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Fetches all the given urls using GET requests and resolves into an array of HTML bodies.
   * The resulting array is in the same order as in which the urls are given.
   */
  protected fetchAll(urls: string[], timeout: number = 500): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const results: string[] = [];

      urls = [...urls];
      const totalUrls = urls.length;

      const doFetching = async () => {
        try {
          const url = urls.shift();

          const result = await this.fetch(url);
          results.push(result);
        } catch (err) {
          reject(err);
          return;
        }

        if (urls.length > 0) {
          (window as any).nanoBar.go((1 - urls.length / totalUrls) * 100);
          setTimeout(doFetching, timeout);
        } else {
          resolve(results);
        }
      };

      doFetching();
    });
  }
}
