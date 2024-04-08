import { EolympNormalProblemParser } from '../problem/EolympNormalProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class EolympNormalContestParser extends SimpleContestParser {
  protected linkSelector = '.eo-problem-row__name';
  protected problemParser = new EolympNormalProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.eolymp.com/*/contests/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]eolymp[.]com\/([a-z]+)\/contests\/(\d+)$/];
  }
}
