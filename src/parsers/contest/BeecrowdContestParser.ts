import { Parser } from '../Parser';
import { BeecrowdProblemParser } from '../problem/BeecrowdProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class BeecrowdContestParser extends SimpleContestParser {
  public linkSelector: string = '#table td.large > a';
  public problemParser: Parser = new BeecrowdProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.beecrowd.com.br/judge/*/challenges/contest/*'];
  }
}
