import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { CodeforcesProblemParser } from '../problem/CodeforcesProblemParser';

export class CodeforcesContestParser extends ContestParser {
  public problemParser: Parser = new CodeforcesProblemParser();
  public linkSelector: string = '.problems > tbody > tr > td:first-child > a';

  public getMatchPatterns(): string[] {
    const patterns: string[] = [];

    [
      'https://codeforces.com/contest/*',
      'https://codeforces.com/gym/*',
      'https://codeforces.com/group/*/contest/*',
    ].forEach(pattern => {
      patterns.push(pattern);
      patterns.push(pattern.replace('https://', 'http://'));
      patterns.push(pattern.replace('https://codeforces.com', 'https://*.codeforces.com'));
      patterns.push(pattern.replace('https://codeforces.com', 'http://*.codeforces.com'));
    });

    return patterns;
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/codeforces[.]com\/(group\/[a-zA-Z0-9]+\/)?(contest|gym)\/(\d+)(\?.*)?$/];
  }
}
