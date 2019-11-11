import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { CodeMarshalProblemParser } from '../problem/CodeMarshalProblemParser';

export class CodeMarshalContestParser extends ContestParser {
  public problemParser: Parser = new CodeMarshalProblemParser();
  public linkSelector: string = '.panel-problems a.list-group-item';

  public getMatchPatterns(): string[] {
    return ['https://algo.codemarshal.org/contests/*'];
  }
}
