import DefaultParser from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export default class KattisProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.Kattis;

  getMatchPatterns(): string[] {
    return [
      'https://*.kattis.com/problems/*',
      'https://*.kattis.com/contests/*/problems/*',
    ];
  }
}
