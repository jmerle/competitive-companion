import { HydroProblemParser } from '../problem/HydroProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HydroContestParser extends SimpleContestParser {
  protected linkSelector = '.col--problem.col--problem-name > a';
  protected problemParser = new HydroProblemParser();

  protected domain = 'hydro.ac';

  public getMatchPatterns(): string[] {
    return [`https://${this.domain}/contest/*`];
  }
}
