import { MarisaOJProblemParser } from '../problem/MarisaOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class MarisaOJContestParser extends SimpleContestParser {
  protected linkSelector = '.problem-table tbody > tr > td:nth-child(2) > a';
  protected problemParser = new MarisaOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://marisaoj.com/mashup/*'];
  }
}
