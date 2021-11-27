import { Parser } from '../Parser';
import { LuoguProblemParser } from '../problem/LuoguProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class LuoguContestParser extends SimpleContestParser {
  public linkSelector: string = 'div.title > a.title';
  public problemParser: Parser = new LuoguProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.luogu.com.cn/contest/*', 'https://www.luogu.com.cn/training/*'];
  }
}
