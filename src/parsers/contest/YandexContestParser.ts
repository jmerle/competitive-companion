import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { YandexProblemParser } from '../problem/YandexProblemParser';

export class YandexContestParser extends ContestParser {
  public problemParser: Parser = new YandexProblemParser();
  public linkSelector: string =
	  'div.page__main > div.content > ul.tabs-menu_role_problems > li > a:nth-child(1)';

  public getMatchPatterns(): string[] {
    return this.problemParser.getMatchPatterns();
  }
}
