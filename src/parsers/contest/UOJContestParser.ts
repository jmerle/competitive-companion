import { UOJProblemParser } from '../problem/UOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class UOJContestParser extends SimpleContestParser {
  protected linkSelector = '.top-buffer-md > .table-responsive > .table a';
  protected problemParser = new UOJProblemParser();

  public getMatchPatterns(): string[] {
    return [
      'https://uoj.ac/contest/*',
      'https://pjudge.ac/contest/*',
      'http://oj.daimayuan.top/problem/*',
      'http://oj.daimayuan.top/course/*/problem/*',
    ];
  }
}
