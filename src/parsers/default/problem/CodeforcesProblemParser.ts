import { DefaultParser } from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export class CodeforcesProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.Codeforces;

  getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*/problem/*',
      'http://codeforces.com/problemset/problem/*/*',
      'http://codeforces.com/gym/*/problem/*',
      'http://codeforces.com/group/*/contest/*/problem/*',
    ];
  }
}
