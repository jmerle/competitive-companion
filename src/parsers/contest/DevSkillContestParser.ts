import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { DevSkillProblemParser } from '../problem/DevSkillProblemParser';

export class DevSkillContestParser extends ContestParser {
  public linkSelector: string = '.contest_requirement > li > a';
  public problemParser: Parser = new DevSkillProblemParser();

  public getMatchPatterns(): string[] {
    return [
      'https://devskill.com/ContestArchive/ContestDetail/*',
      'https://www.devskill.com/ContestArchive/ContestDetail/*',
    ];
  }
}
