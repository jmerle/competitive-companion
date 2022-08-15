import { HDOJNGProblemParser } from '../problem/HDOJNGProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HDOJNGContestParser extends SimpleContestParser {
  protected linkSelector = '.page-card-table > tbody > tr > td:nth-child(3) > a';
  protected problemParser = new HDOJNGProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.hdu.edu.cn/contest/problems\\?*'];
  }
}
