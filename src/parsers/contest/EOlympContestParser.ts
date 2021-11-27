import { Parser } from '../Parser';
import { EOlympProblemParser } from '../problem/EOlympProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class EOlympContestParser extends SimpleContestParser {
  public linkSelector: string = '.eo-problem-row__name';
  public problemParser: Parser = new EOlympProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.e-olymp.com/*/contests/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]e-olymp[.]com\/([a-z]+)\/contests\/(\d+)$/];
  }
}
