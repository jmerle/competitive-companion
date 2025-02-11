import { CodeRunProblemParser } from '../problem/CodeRunProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CodeRunContestParser extends SimpleContestParser {
  protected linkSelector = 'a[class^="CatalogSearchResultItem_problem-card__link"]';
  protected problemParser = new CodeRunProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://coderun.yandex.ru/selections/*'];
  }
}
