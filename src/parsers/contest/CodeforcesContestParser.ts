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
      'https://codeforces.com/edu/course/*/lesson/*/*/practice',
    ].forEach(pattern => {
      patterns.push(pattern);
      patterns.push(pattern.replace('https://codeforces.com', 'https://*.codeforces.com'));
    });

    const mlPatterns = patterns.map(pattern => pattern.replace('.com', '.ml'));
    const esPatterns = patterns.map(pattern => pattern.replace('codeforces.com', 'codeforc.es'));

    return patterns.concat(mlPatterns).concat(esPatterns);
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /^https?:\/\/codeforces[.]com\/(group\/[a-zA-Z0-9]+\/)?(contest|gym)\/(\d+)(\?.*)?$/,
      /^https?:\/\/codeforces[.]com\/edu\/course\/\d+\/lesson\/\d+\/\d+\/practice(\?.*)?$/,
    ];
  }
}
