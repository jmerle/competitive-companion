import DefaultParser from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export default class BayanProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.Bayan;

  getMatchPatterns(): string[] {
    return ['http://contest.bayan.ir/en/contest/*/problems/*'];
  }
}
