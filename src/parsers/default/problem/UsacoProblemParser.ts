import DefaultParser from "../DefaultParser";
import {DefaultWebsite} from "../../../models/DefaultTask";

export default class UsacoProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.Usaco;

  getMatchPatterns(): string[] {
    return [
      'http://www.usaco.org/current/index.php?page=viewproblem*',
      'http://www.usaco.org/index.php?page=viewproblem*',
      'http://usaco.org/current/index.php?page=viewproblem*',
      'http://usaco.org/index.php?page=viewproblem*',
    ];
  }
}
