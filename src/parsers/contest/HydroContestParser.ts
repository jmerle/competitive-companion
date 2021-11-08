import { Parser } from '../Parser';
import { HydroProblemParser } from '../problem/HydroProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HydroContestParser extends SimpleContestParser {
  public problemParser: Parser = new HydroProblemParser();
  public linkSelector: string = '.col--problem.col--problem-name > a';

  public getMatchPatterns(): string[] {
    return ['https://hydro.ac/contest/*'];
  }
}
