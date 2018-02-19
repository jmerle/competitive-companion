import ContestParser from '../ContestParser';
import Parser from '../../Parser';
import CodeforcesProblemParser from '../problem/CodeforcesProblemParser';

export default class CodeforcesContestParser extends ContestParser {
  problemParser: Parser = new CodeforcesProblemParser();
  linkSelector: string = '.problems > tbody > tr > td:first-child > a';

  getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*',
      'http://codeforces.com/gym/*',
    ];
  }

  getRegularExpressions(): RegExp[] {
    return [/^http:\/\/codeforces[.](ru|com)\/(contest|gym)\/(\d+)$/];
  }
}
