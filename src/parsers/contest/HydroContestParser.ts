import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { HydroProblemParser } from '../problem/HydroProblemParser';

export class HydroContestParser extends ContestParser {
  public problemParser: Parser = new HydroProblemParser();
  public linkSelector: string = '.col--problem.col--problem-name > a';

  public getMatchPatterns(): string[] {
    return ['https://hydro.ac/contest/*'];
  }
}
