import { CodeMarshalProblemParser } from '../problem/CodeMarshalProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CodeMarshalContestParser extends SimpleContestParser {
  protected linkSelector = '.panel-problems a.list-group-item';
  protected problemParser = new CodeMarshalProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://algo.codemarshal.org/contests/*'];
  }
}
