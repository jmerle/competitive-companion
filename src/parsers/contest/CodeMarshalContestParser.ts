import { Parser } from '../Parser';
import { CodeMarshalProblemParser } from '../problem/CodeMarshalProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CodeMarshalContestParser extends SimpleContestParser {
  public problemParser: Parser = new CodeMarshalProblemParser();
  public linkSelector: string = '.panel-problems a.list-group-item';

  public getMatchPatterns(): string[] {
    return ['https://algo.codemarshal.org/contests/*'];
  }
}
