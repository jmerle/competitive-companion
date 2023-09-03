import { UOJProblemParser } from '../problem/UOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class UOJContestParser extends SimpleContestParser {
  protected linkSelector = '.top-buffer-md > .table-responsive > .table a';
  protected problemParser = new UOJProblemParser();

  public getMatchPatterns(): string[] {
    return Object.keys(UOJProblemParser.domains)
      .map(domain => `https://${domain}/contest/*`)
      .flatMap(p => [p, p.replace('https', 'http')]);
  }
}
