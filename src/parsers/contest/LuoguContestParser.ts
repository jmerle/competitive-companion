import { LuoguProblemParser } from '../problem/LuoguProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class LuoguContestParser extends SimpleContestParser {
  protected linkSelector = 'div.title > a.title';
  protected problemParser = new LuoguProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.luogu.com.cn/contest/*', 'https://www.luogu.com.cn/training/*'];
  }
}
