import { Parser } from '../Parser';
import { EolympProblemParser } from '../problem/EolympProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class EolympContestParser extends SimpleContestParser {
  public linkSelector: string = '.eo-problem-row__name';
  public problemParser: Parser = new EolympProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.eolymp.com/*/contests/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]eolymp[.]com\/([a-z]+)\/contests\/(\d+)$/];
  }
}
