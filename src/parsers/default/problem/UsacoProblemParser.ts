import { DefaultParser } from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export class UsacoProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.Usaco;

  getMatchPatterns(): string[] {
    return [
      'http://www.usaco.org/current/index.php*',
      'http://www.usaco.org/index.php*',
      'http://usaco.org/current/index.php*',
      'http://usaco.org/index.php*',
    ];
  }

  canHandlePage(): boolean {
    return window.location.search.includes('page=viewproblem');
  }
}
