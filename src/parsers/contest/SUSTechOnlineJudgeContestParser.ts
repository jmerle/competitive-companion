import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { SUSTechOnlineJudgeProblemParser } from '../problem/SUSTechOnlineJudgeProblemParser';

export class SUSTechOnlineJudgeContestParser extends ContestParser {
  public linkSelector: string = '#problemset tbody tr > td:nth-child(3) > a';
  public problemParser: Parser = new SUSTechOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.sustc.edu.cn/onlinejudge/contest.php*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /http:\/\/acm\.sustc\.edu\.cn\/onlinejudge\/contest\.php\?(.*)cid=(\d+)(.*)/,
    ];
  }
}
