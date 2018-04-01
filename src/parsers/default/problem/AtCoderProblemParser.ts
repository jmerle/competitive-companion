import { DefaultParser } from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export class AtCoderProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.AtCoder;

  getMatchPatterns(): string[] {
    return ['https://*.contest.atcoder.jp/tasks/*'];
  }
}
