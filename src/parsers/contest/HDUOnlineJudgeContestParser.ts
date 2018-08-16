import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { HDUOnlineJudgeProblemParser } from '../problem/HDUOnlineJudgeProblemParser';

export class HDUOnlineJudgeContestParser extends ContestParser {
  public linkSelector: string = 'tr.table_text a';
  public problemParser: Parser = new HDUOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.hdu.edu.cn/contests/contest_show.php*'];
  }
}
