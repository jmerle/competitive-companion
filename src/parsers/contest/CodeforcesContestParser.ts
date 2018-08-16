import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { CodeforcesProblemParser } from '../problem/CodeforcesProblemParser';

export class CodeforcesContestParser extends ContestParser {
  public problemParser: Parser = new CodeforcesProblemParser();
  public linkSelector: string = '.problems > tbody > tr > td:first-child > a';

  public getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*',
      'https://codeforces.com/contest/*',
      'http://codeforces.com/gym/*',
      'https://codeforces.com/gym/*',
      'http://codeforces.com/group/*/contest/*',
      'https://codeforces.com/group/*/contest/*',
    ];
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /^http:\/\/codeforces[.]com\/(group\/[a-zA-Z0-9]+\/)?(contest|gym)\/(\d+)$/,
    ];
  }
}
