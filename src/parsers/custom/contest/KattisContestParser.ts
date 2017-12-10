import ContestParser from "../ContestParser";
import Parser from "../../Parser";
import KattisProblemParser from "../../default/problem/KattisProblemParser";

export default class KattisContestParser extends ContestParser {
  problemParser: Parser = new KattisProblemParser();
  linkSelector: string = '#standings > thead > tr > th.problemcolheader-standings > a';

  getMatchPatterns(): string[] {
    return ['https://open.kattis.com/contests/*'];
  }

  getRegularExpressions(): RegExp[] {
    return [/^https:\/\/.*[.]kattis[.]com\/contests\/([a-z0-9]+)(\/standings)?$/];
  }
}
