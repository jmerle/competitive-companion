import { Parser } from './Parser';
import { A2OJProblemParser } from './problem/A2OJProblemParser';
import { AtCoderProblemParser } from './problem/AtCoderProblemParser';
import { AtCoderContestParser } from './contest/AtCoderContestParser';
import { CodeChefProblemParser } from './problem/CodeChefProblemParser';
import { CodeChefContestParser } from './contest/CodeChefContestParser';
import { CodeforcesProblemParser } from './problem/CodeforcesProblemParser';
import { CodeforcesContestParser } from './contest/CodeforcesContestParser';
import { COJProblemParser } from './problem/COJProblemParser';
import { COJContestParser } from './contest/COJContestParser';
import { CSAcademyProblemParser } from './problem/CSAcademyProblemParser';
import { DevSkillProblemParser } from './problem/DevSkillProblemParser';
import { DevSkillContestParser } from './contest/DevSkillContestParser';
import { DMOJProblemParser } from './problem/DMOJProblemParser';
import { DMOJContestParser } from './contest/DMOJContestParser';
import { EOlympProblemParser } from './problem/EOlympProblemParser';
import { EOlympContestParser } from './contest/EOlympContestParser';
import { FacebookHackerCupProblemParser } from './problem/FacebookHackerCupProblemParser';
import { HackerEarthProblemParser } from './problem/HackerEarthProblemParser';
import { HackerEarthCodeArenaParser } from './problem/HackerEarthCodeArenaParser';
import { HackerEarthContestParser } from './contest/HackerEarthContestParser';
import { HackerRankProblemParser } from './problem/HackerRankProblemParser';
import { HackerRankContestParser } from './contest/HackerRankContestParser';
import { HDUOnlineJudgeProblemParser } from './problem/HDUOnlineJudgeProblemParser';
import { HDUOnlineJudgeContestParser } from './contest/HDUOnlineJudgeContestParser';
import { JutgeProblemParser } from './problem/JutgeProblemParser';
import { KattisProblemParser } from './problem/KattisProblemParser';
import { KattisContestParser } from './contest/KattisContestParser';
import { LightOJProblemParser } from './problem/LightOJProblemParser';
import { LightOJContestParser } from './contest/LightOJContestParser';
import { OldGoogleCodeJamContestParser } from './contest/OldGoogleCodeJamContestParser';
import { NewGoogleCodeJamProblemParser } from './problem/NewGoogleCodeJamProblemParser';
import { OmegaUpProblemParser } from './problem/OmegaUpProblemParser';
import { PandaOnlineJudgeProblemParser } from './problem/PandaOnlineJudgeProblemParser';
import { PEGJudgeProblemParser } from './problem/PEGJudgeProblemParser';
import { PEGJudgeContestParser } from './contest/PEGJudgeContestParser';
import { POJProblemParser } from './problem/POJProblemParser';
import { POJContestParser } from './contest/POJContestParser';
import { SPOJProblemParser } from './problem/SPOJProblemParser';
import { TimusProblemParser } from './problem/TimusProblemParser';
import { TimusContestParser } from './contest/TimusContestParser';
import { TophProblemParser } from './problem/TophProblemParser';
import { URIOnlineJudgeProblemParser } from './problem/URIOnlineJudgeProblemParser';
import { URIOnlineJudgeContestParser } from './contest/URIOnlineJudgeContestParser';
import { USACOProblemParser } from './problem/USACOProblemParser';
import { USACOTrainingProblemParser } from './problem/USACOTrainingProblemParser';
import { YandexProblemParser } from './problem/YandexProblemParser';

export const parsers: Parser[] = [
  new A2OJProblemParser(),

  new AtCoderProblemParser(),
  new AtCoderContestParser(),

  new CodeChefProblemParser(),
  new CodeChefContestParser(),

  new CodeforcesProblemParser(),
  new CodeforcesContestParser(),

  new COJProblemParser(),
  new COJContestParser(),

  new CSAcademyProblemParser(),

  new DevSkillProblemParser(),
  new DevSkillContestParser(),

  new DMOJProblemParser(),
  new DMOJContestParser(),

  new EOlympProblemParser(),
  new EOlympContestParser(),

  new FacebookHackerCupProblemParser(),

  new HackerEarthProblemParser(),
  new HackerEarthCodeArenaParser(),
  new HackerEarthContestParser(),

  new HackerRankProblemParser(),
  new HackerRankContestParser(),

  new HDUOnlineJudgeProblemParser(),
  new HDUOnlineJudgeContestParser(),

  new JutgeProblemParser(),

  new KattisProblemParser(),
  new KattisContestParser(),

  new LightOJProblemParser(),
  new LightOJContestParser(),

  new OldGoogleCodeJamContestParser(),
  new NewGoogleCodeJamProblemParser(),

  new OmegaUpProblemParser(),

  new PandaOnlineJudgeProblemParser(),

  new PEGJudgeProblemParser(),
  new PEGJudgeContestParser(),

  new POJProblemParser(),
  new POJContestParser(),

  new SPOJProblemParser(),

  new TimusProblemParser(),
  new TimusContestParser(),

  new TophProblemParser(),

  new URIOnlineJudgeProblemParser(),
  new URIOnlineJudgeContestParser(),

  new USACOProblemParser(),
  new USACOTrainingProblemParser(),

  new YandexProblemParser(),
];
