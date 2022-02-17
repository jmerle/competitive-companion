import { YandexProblemParser } from '../problem/YandexProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class YandexContestParser extends SimpleContestParser {
  protected linkSelector = 'div.page__main > div.content > ul.tabs-menu_role_problems > li > a:nth-child(1)';
  protected problemParser = new YandexProblemParser();

  public getMatchPatterns(): string[] {
    // Only available via the "Parse with" context menu as Yandex doesn't have a specific page that shows all problems
    return [];
  }
}
