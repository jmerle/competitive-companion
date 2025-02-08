import { EtigerProblemParser } from '../problem/EtigerProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class EtigerContestParser extends SimpleContestParser {
  protected linkSelector = 'tr.ant-table-row > td:nth-child(2) > a';
  protected problemParser = new EtigerProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.etiger.vip/match_info'];
  }
}
