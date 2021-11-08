import { Parser } from '../Parser';
import { YandexProblemParser } from '../problem/YandexProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class YandexContestParser extends SimpleContestParser {
  public linkSelector: string = 'div.page__main > div.content > ul.tabs-menu_role_problems > li > a:nth-child(1)';
  public problemParser: Parser = new YandexProblemParser();

  public getMatchPatterns(): string[] {
    // Only available via the "Parse with" context menu as Yandex doesn't have a specific page that shows all problems
    return [];
  }
}
