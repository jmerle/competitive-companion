import DefaultParser from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export default class GoogleCodeJamContestParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.GoogleCodeJam;

  getMatchPatterns(): string[] {
    return ['https://code.google.com/codejam/contest/*/dashboard'];
  }
}
