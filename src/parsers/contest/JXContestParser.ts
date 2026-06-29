import { SimpleContestParser } from '../SimpleContestParser';
import { JXProblemParser } from '../problem/JXProblemParser';

export class JXContestParser extends SimpleContestParser {
  // 选择器：表格中每一行的第二个单元格（题目列）里的 <a> 标签
  protected linkSelector = 'a[href*="/problem/"]';
  protected problemParser = new JXProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://jx.7fa4.cn:8888/contest/*', 'http://jx.7fa4.cn:5283/contest/*', "http://jx.7fa4.cn:8888/problems/tag/*", "http://jx.7fa4.cn:5283/problems/tag/*"];
  }
}
