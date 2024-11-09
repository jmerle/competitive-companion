import { SeriousOJProblemParser } from '../problem/SeriousOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class SeriousOJContestParser extends SimpleContestParser {
  protected linkSelector = '.col--problem.col--problem-name > a';
  protected problemParser = new SeriousOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://judge.eluminatis-of-lu.com/contest/*'];
  }
}
