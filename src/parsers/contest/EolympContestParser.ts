import { EolympProblemParser } from '../problem/EolympProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class EolympContestParser extends SimpleContestParser {
  protected linkSelector = '.eo-problem-row__name';
  protected problemParser = new EolympProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.eolymp.com/*/contests/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]eolymp[.]com\/([a-z]+)\/contests\/(\d+)$/];
  }
}
