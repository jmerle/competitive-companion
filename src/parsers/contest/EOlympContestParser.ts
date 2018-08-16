import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { EOlympProblemParser } from '../problem/EOlympProblemParser';

export class EOlympContestParser extends ContestParser {
  public problemParser: Parser = new EOlympProblemParser();
  public linkSelector: string = '.eo-problem-row__name';

  public getMatchPatterns(): string[] {
    return ['https://www.e-olymp.com/*/contests/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]e-olymp[.]com\/([a-z]+)\/contests\/(\d+)$/];
  }
}
