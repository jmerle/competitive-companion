import { HDOJProblemParser } from '../problem/HDOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HDOJContestParser extends SimpleContestParser {
  protected linkSelector = 'tr.table_text a';
  protected problemParser = new HDOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.hdu.edu.cn/contests/contest_show.php*'];
  }
}
