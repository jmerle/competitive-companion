import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { DevSkillProblemParser } from '../problem/DevSkillProblemParser';

export class DevSkillContestParser extends ContestParser {
  linkSelector: string = '.contest_requirement > li > a';
  problemParser: Parser = new DevSkillProblemParser();

  getMatchPatterns(): string[] {
    return [
      'https://devskill.com/ContestArchive/ContestDetail/*',
      'https://www.devskill.com/ContestArchive/ContestDetail/*',
    ];
  }
}
