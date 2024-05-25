import { InfoArenaProblemParser } from './InfoArenaProblemParser';

export class NerdArenaProblemParser extends InfoArenaProblemParser {
  protected getJudgeName(): string {
    return 'NerdArena';
  }
}
