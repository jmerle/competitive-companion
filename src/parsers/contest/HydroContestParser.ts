import { HydroProblemParser } from '../problem/HydroProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HydroContestParser extends SimpleContestParser {
  protected linkSelector = '.col--problem.col--problem-name > a';
  protected problemParser = new HydroProblemParser();

  public getMatchPatterns(): string[] {
    const patterns = [];

    for (const domain of ['hydro.ac', 'oiclass.com']) {
      patterns.push(`https://${domain}/contest/*`);
    }

    return patterns;
  }
}
