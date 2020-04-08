import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { HDOJProblemParser } from '../problem/HDOJProblemParser';

export class HDOJContestParser extends ContestParser {
  public linkSelector: string = 'tr.table_text a';
  public problemParser: Parser = new HDOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.hdu.edu.cn/contests/contest_show.php*'];
  }
}
