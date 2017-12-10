import Parser from "./Parser";
import AtCoderProblemParser from "./default/problem/AtCoderProblemParser";
import BayanProblemParser from "./default/problem/BayanProblemParser";
import CodeforcesProblemParser from "./default/problem/CodeforcesProblemParser";
import FacebookHackerCupProblemParser from "./default/problem/FacebookHackerCupProblemParser";
import KattisProblemParser from "./default/problem/KattisProblemParser";
import UsacoProblemParser from "./default/problem/UsacoProblemParser";
import YandexProblemParser from "./default/problem/YandexProblemParser";
import GoogleCodeJamContestParser from "./default/contest/GoogleCodeJamContestParser";
import HackerRankProblemParser from "./custom/problem/HackerRankProblemParser";
import KattisContestParser from "./custom/contest/KattisContestParser";
import CodeforcesContestParser from "./custom/contest/CodeforcesContestParser";
import HackerEarthProblemParser from "./custom/problem/HackerEarthProblemParser";
import HackerEarthCodeArenaParser from "./custom/problem/HackerEarthCodeArenaParser";
import TimusProblemParser from "./custom/problem/TimusProblemParser";
import TimusContestParser from "./custom/contest/TimusContestParser";
import EOlympProblemParser from "./custom/problem/EOlympProblemParser";
import EOlympContestParser from "./custom/contest/EOlympContestParser";
import CodeChefProblemParser from "./custom/problem/CodeChefProblemParser";
import CodeChefContestParser from "./custom/contest/CodeChefContestParser";
import HackerEarthContestParser from "./custom/contest/HackerEarthContestParser";
import HackerRankContestParser from "./custom/contest/HackerRankContestParser";
import AtCoderContestParser from "./custom/contest/AtCoderContestParser";
import CSAcademyProblemParser from "./custom/problem/CSAcademyProblemParser";

const parsers: Parser[] = [
  // Default problem parsers
  new AtCoderProblemParser(),
  new BayanProblemParser(),
  new CodeforcesProblemParser(),
  new FacebookHackerCupProblemParser(),
  new KattisProblemParser(),
  new UsacoProblemParser(),
  new YandexProblemParser(),

  // Default contest parsers
  new GoogleCodeJamContestParser(),

  // Custom problem parsers
  new HackerRankProblemParser(),
  new HackerEarthProblemParser(),
  new HackerEarthCodeArenaParser(),
  new TimusProblemParser(),
  new EOlympProblemParser(),
  new CodeChefProblemParser(),
  new CSAcademyProblemParser(),

  // Custom contest parsers
  new KattisContestParser(),
  new CodeforcesContestParser(),
  new TimusContestParser(),
  new EOlympContestParser(),
  new CodeChefContestParser(),
  new HackerEarthContestParser(),
  new HackerRankContestParser(),
  new AtCoderContestParser(),
];

export default parsers;
