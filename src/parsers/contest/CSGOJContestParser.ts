import { CSGOJProblemParser } from '../problem/CSGOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CSGOJContestParser extends SimpleContestParser {
  protected linkSelector = 'table tbody tr td:nth-child(3) a';
  protected problemParser = new CSGOJProblemParser();

  public getMatchPatterns(): string[] {
    return [
      'https://acm.sztu.edu.cn/*/contest/problemset*',
      'https://cpc.csgrandeur.cn/*/contest/problemset*',
      'http://acm.sztu.edu.cn:50100/*/*/problemset*',
    ];
  }
}
