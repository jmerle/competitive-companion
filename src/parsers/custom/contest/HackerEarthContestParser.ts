import ContestParser from "../ContestParser";
import Parser from "../../Parser";
import HackerEarthProblemParser from "../problem/HackerEarthProblemParser";

export default class HackerEarthContestParser extends ContestParser {
  problemParser: Parser = new HackerEarthProblemParser();
  linkSelector: string = '.problems-table .prob a';

  getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/challenge/*/problems/'];
  }
}
