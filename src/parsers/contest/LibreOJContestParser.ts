import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { LibreOJProblemParser } from '../problem/LibreOJProblemParser';

export class LibreOJContestParser extends ContestParser {
  public problemParser: Parser = new LibreOJProblemParser();
  public linkSelector: string = '.ui.selectable.celled.table > tbody > tr > td:nth-child(2) > a';

  public getMatchPatterns(): string[] {
    return ['https://libreoj.github.io/contest/*'];
  }
}
