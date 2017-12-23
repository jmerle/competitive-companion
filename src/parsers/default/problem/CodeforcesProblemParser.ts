import DefaultParser from "../DefaultParser";
import { DefaultWebsite } from "../../../models/DefaultTask";

export default class CodeforcesProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.Codeforces;

  getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*/problem/*',
      'http://codeforces.com/problemset/problem/*/*',
      'http://codeforces.com/gym/*/problem/*',
      'http://codeforces.ru/contest/*/problem/*',
      'http://codeforces.ru/problemset/problem/*/*',
      'http://codeforces.ru/gym/*/problem/*',
    ];
  }
}
