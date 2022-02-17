import { DevSkillProblemParser } from '../problem/DevSkillProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class DevSkillContestParser extends SimpleContestParser {
  protected linkSelector = '.contest_requirement > li > a';
  protected problemParser = new DevSkillProblemParser();

  public getMatchPatterns(): string[] {
    return [
      'https://devskill.com/ContestArchive/ContestDetail/*',
      'https://www.devskill.com/ContestArchive/ContestDetail/*',
    ];
  }
}
