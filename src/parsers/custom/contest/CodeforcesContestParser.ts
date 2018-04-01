import { ContestParser } from '../ContestParser';
import { Parser } from '../../Parser';
import { CodeforcesProblemParser } from '../problem/CodeforcesProblemParser';

export class CodeforcesContestParser extends ContestParser {
  problemParser: Parser = new CodeforcesProblemParser();
  linkSelector: string = '.problems > tbody > tr > td:first-child > a';

  getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*',
      'http://codeforces.com/gym/*',
      'http://codeforces.com/group/*/contest/*',
    ];
  }

  getRegularExpressions(): RegExp[] {
    return [/^http:\/\/codeforces[.]com\/(group\/[a-zA-Z0-9]+\/)?(contest|gym)\/(\d+)$/];
  }
}
