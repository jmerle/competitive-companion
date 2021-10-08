import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { YandexProblemParser } from '../problem/YandexProblemParser';

export class YandexContestParser extends ContestParser {
  public linkSelector: string = 'div.page__main > div.content > ul.tabs-menu_role_problems > li > a:nth-child(1)';
  public problemParser: Parser = new YandexProblemParser();

  public getMatchPatterns(): string[] {
    // Only available via the "Parse with" context menu as Yandex doesn't have a specific page that shows all problems
    return [];
  }
}
