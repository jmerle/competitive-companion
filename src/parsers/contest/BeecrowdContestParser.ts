import { BeecrowdProblemParser } from '../problem/BeecrowdProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class BeecrowdContestParser extends SimpleContestParser {
  protected linkSelector = '#table td.large > a';
  protected problemParser = new BeecrowdProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://judge.beecrowd.com/*/challenges/contest/*'];
  }
}
