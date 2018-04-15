import { Parser } from './Parser';
import { HackerRankProblemParser } from './problem/HackerRankProblemParser';
import { KattisContestParser } from './contest/KattisContestParser';
import { CodeforcesContestParser } from './contest/CodeforcesContestParser';
import { HackerEarthProblemParser } from './problem/HackerEarthProblemParser';
import { HackerEarthCodeArenaParser } from './problem/HackerEarthCodeArenaParser';
import { TimusProblemParser } from './problem/TimusProblemParser';
import { TimusContestParser } from './contest/TimusContestParser';
import { EOlympProblemParser } from './problem/EOlympProblemParser';
import { EOlympContestParser } from './contest/EOlympContestParser';
import { CodeChefProblemParser } from './problem/CodeChefProblemParser';
import { CodeChefContestParser } from './contest/CodeChefContestParser';
import { HackerEarthContestParser } from './contest/HackerEarthContestParser';
import { HackerRankContestParser } from './contest/HackerRankContestParser';
import { AtCoderContestParser } from './contest/AtCoderContestParser';
import { CSAcademyProblemParser } from './problem/CSAcademyProblemParser';
import { USACOTrainingProblemParser } from './problem/USACOTrainingProblemParser';
import { DevSkillProblemParser } from './problem/DevSkillProblemParser';
import { DevSkillContestParser } from './contest/DevSkillContestParser';
import { DMOJProblemParser } from './problem/DMOJProblemParser';
import { DMOJContestParser } from './contest/DMOJContestParser';
import { URIOnlineJudgeProblemParser } from './problem/URIOnlineJudgeProblemParser';
import { URIOnlineJudgeContestParser } from './contest/URIOnlineJudgeContestParser';
import { LightOJProblemParser } from './problem/LightOJProblemParser';
import { LightOJContestParser } from './contest/LightOJContestParser';
import { SPOJProblemParser } from './problem/SPOJProblemParser';
import { PandaOnlineJudgeProblemParser } from './problem/PandaOnlineJudgeProblemParser';
import { CodeforcesProblemParser } from './problem/CodeforcesProblemParser';
import { AtCoderProblemParser } from './problem/AtCoderProblemParser';
import { YandexProblemParser } from './problem/YandexProblemParser';
import { KattisProblemParser } from './problem/KattisProblemParser';
import { USACOProblemParser } from './problem/USACOProblemParser';
import { FacebookHackerCupProblemParser } from './problem/FacebookHackerCupProblemParser';
import { OldGoogleCodeJamContestParser } from './contest/OldGoogleCodeJamContestParser';
import { NewGoogleCodeJamProblemParser } from './problem/NewGoogleCodeJamProblemParser';

export const parsers: Parser[] = [
  // Problem parsers
  new HackerRankProblemParser(),
  new HackerEarthProblemParser(),
  new HackerEarthCodeArenaParser(),
  new TimusProblemParser(),
  new EOlympProblemParser(),
  new CodeChefProblemParser(),
  new CSAcademyProblemParser(),
  new USACOTrainingProblemParser(),
  new DevSkillProblemParser(),
  new DMOJProblemParser(),
  new URIOnlineJudgeProblemParser(),
  new LightOJProblemParser(),
  new SPOJProblemParser(),
  new PandaOnlineJudgeProblemParser(),
  new CodeforcesProblemParser(),
  new AtCoderProblemParser(),
  new YandexProblemParser(),
  new KattisProblemParser(),
  new USACOProblemParser(),
  new FacebookHackerCupProblemParser(),
  new NewGoogleCodeJamProblemParser(),

  // Contest parsers
  new KattisContestParser(),
  new CodeforcesContestParser(),
  new TimusContestParser(),
  new EOlympContestParser(),
  new CodeChefContestParser(),
  new HackerEarthContestParser(),
  new HackerRankContestParser(),
  new AtCoderContestParser(),
  new DevSkillContestParser(),
  new DMOJContestParser(),
  new URIOnlineJudgeContestParser(),
  new LightOJContestParser(),
  new OldGoogleCodeJamContestParser(),
];
