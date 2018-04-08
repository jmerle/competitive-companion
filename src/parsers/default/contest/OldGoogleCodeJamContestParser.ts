import { DefaultParser } from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export class OldGoogleCodeJamContestParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.OldGoogleCodeJam;

  getMatchPatterns(): string[] {
    return ['https://code.google.com/codejam/contest/*/dashboard'];
  }
}
