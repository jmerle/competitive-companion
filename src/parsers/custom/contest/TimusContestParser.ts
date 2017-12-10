import ContestParser from "../ContestParser";
import Parser from "../../Parser";
import TimusProblemParser from "../problem/TimusProblemParser";

export default class TimusContestParser extends ContestParser {
  problemParser: Parser = new TimusProblemParser();
  linkSelector: string = '.problemset td.name > a';

  getMatchPatterns(): string[] {
    return ['http://acm.timus.ru/problemset.aspx*'];
  }

  getRegularExpressions(): RegExp[] {
    return [/^http:\/\/acm[.]timus[.]ru\/problemset[.]aspx\?space=(\d+)(&locale=(en|ru))?$/];
  }
}
