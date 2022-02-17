import { LibreOJProblemParser } from '../problem/LibreOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class LibreOJContestParser extends SimpleContestParser {
  protected linkSelector = '.ui.selectable.celled.table > tbody > tr > td:nth-child(2) > a';
  protected problemParser = new LibreOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://libreoj.github.io/contest/*'];
  }
}
