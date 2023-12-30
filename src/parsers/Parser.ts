import { Sendable } from '../models/Sendable';
import { matchPatternToRegExp } from '../vendor/match-pattern-to-reg-exp';

export abstract class Parser {
  /**
   * Returns the match patterns which this problemParser can handle. These are the
   * patterns that are used for the matches key of the content script in the manifest.
   * More information about match patterns: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns
   */
  public abstract getMatchPatterns(): string[];

  /**
   * Returns the match patterns which this problemParser can't handle. These are the
   * patterns that are used for the exclude_matches key of the content script in the manifest.
   */
  public getExcludedMatchPatterns(): string[] {
    return [];
  }

  /**
   * Returns the regular expressions which this problemParser can handle. These are
   * used to check whether a page can be handled by this problemParser, and allow for more
   * specific rules than getMatchPatterns, which is used because the extension manifest
   * does not allow regular expressions.
   */
  public getRegularExpressions(): RegExp[] {
    return this.getMatchPatterns().map(matchPatternToRegExp);
  }

  /**
   * The excluded version of getRegularExpressions(). If a regular expression coming
   * from this method matches the url, this parser will explicitly not be used,
   * even if a regular expression from getRegularExpressions() does match.
   */
  public getExcludedRegularExpressions(): RegExp[] {
    return this.getExcludedMatchPatterns().map(matchPatternToRegExp);
  }

  /**
   * When one of the regular expressions of this parser matches the current url, this method is called.
   * If it returns true, it is assumed the parser can load this page. This is useful for contest
   * parsers where the url might not give away whether the contest problems are already available.
   */
  public canHandlePage(): boolean {
    return true;
  }

  /**
   * The method called when the parse button is clicked.
   */
  public abstract parse(url: string, html: string): Promise<Sendable>;
}
