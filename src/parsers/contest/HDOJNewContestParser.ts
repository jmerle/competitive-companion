import { HDOJNewProblemParser } from '../problem/HDOJNewProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HDOJNewContestParser extends SimpleContestParser {
  protected linkSelector = '.page-card-table > tbody > tr > td:nth-child(3) > a';
  protected problemParser = new HDOJNewProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.hdu.edu.cn/contest/problems\\?*'].flatMap(p => [p, p.replace('https', 'http')]);
  }
}
