import { Parser } from '../Parser';
import { DevSkillProblemParser } from '../problem/DevSkillProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class DevSkillContestParser extends SimpleContestParser {
  public linkSelector: string = '.contest_requirement > li > a';
  public problemParser: Parser = new DevSkillProblemParser();

  public getMatchPatterns(): string[] {
    return [
      'https://devskill.com/ContestArchive/ContestDetail/*',
      'https://www.devskill.com/ContestArchive/ContestDetail/*',
    ];
  }
}
