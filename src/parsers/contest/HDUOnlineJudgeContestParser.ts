import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { HDUOnlineJudgeProblemParser } from '../problem/HDUOnlineJudgeProblemParser';

export class HDUOnlineJudgeContestParser extends ContestParser {
  linkSelector: string = 'tr.table_text a';
  problemParser: Parser = new HDUOnlineJudgeProblemParser();

  getMatchPatterns(): string[] {
    return ['http://acm.hdu.edu.cn/contests/contest_show.php*'];
  }
}
