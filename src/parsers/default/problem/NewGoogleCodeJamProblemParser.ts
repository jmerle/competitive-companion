import { DefaultParser } from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export class NewGoogleCodeJamProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.NewGoogleCodeJam;

  getMatchPatterns(): string[] {
    return [
      'https://codejam.withgoogle.com/*/challenges/*/dashboard',
      'https://codejam.withgoogle.com/*/challenges/*/dashboard/*',
    ];
  }
}
