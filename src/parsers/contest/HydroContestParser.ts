import { HydroProblemParser } from '../problem/HydroProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HydroContestParser extends SimpleContestParser {
  protected linkSelector = '.col--problem.col--problem-name > a';
  protected problemParser = new HydroProblemParser();

  public getMatchPatterns(): string[] {
    return Object.keys(HydroProblemParser.DOMAINS).map(domain => `https://${domain}/contest/*`);
  }
}
