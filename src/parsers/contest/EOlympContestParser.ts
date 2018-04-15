import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { EOlympProblemParser } from '../problem/EOlympProblemParser';

export class EOlympContestParser extends ContestParser {
  problemParser: Parser = new EOlympProblemParser();
  linkSelector: string = '.eo-problem-row__name';

  getMatchPatterns(): string[] {
    return ['https://www.e-olymp.com/*/contests/*'];
  }

  getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]e-olymp[.]com\/([a-z]+)\/contests\/(\d+)$/];
  }
}
