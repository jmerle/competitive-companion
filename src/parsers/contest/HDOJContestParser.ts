import { Parser } from '../Parser';
import { HDOJProblemParser } from '../problem/HDOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HDOJContestParser extends SimpleContestParser {
  public linkSelector: string = 'tr.table_text a';
  public problemParser: Parser = new HDOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.hdu.edu.cn/contests/contest_show.php*'];
  }
}
