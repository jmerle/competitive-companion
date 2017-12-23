import DefaultParser from "../DefaultParser";
import { DefaultWebsite } from "../../../models/DefaultTask";

export default class FacebookHackerCupProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.FacebookHackerCup;

  getMatchPatterns(): string[] {
    return ['https://www.facebook.com/hackercup/problem/*'];
  }
}
