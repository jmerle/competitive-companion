import { AtCoderContestParser } from './contest/AtCoderContestParser';
import { CodeChefContestParser } from './contest/CodeChefContestParser';
import { CodeforcesContestParser } from './contest/CodeforcesContestParser';
import { COJContestParser } from './contest/COJContestParser';
import { DevSkillContestParser } from './contest/DevSkillContestParser';
import { DMOJContestParser } from './contest/DMOJContestParser';
import { EOlympContestParser } from './contest/EOlympContestParser';
import { HackerEarthContestParser } from './contest/HackerEarthContestParser';
import { HackerRankContestParser } from './contest/HackerRankContestParser';
import { HDUOnlineJudgeContestParser } from './contest/HDUOnlineJudgeContestParser';
import { KattisContestParser } from './contest/KattisContestParser';
import { LightOJContestParser } from './contest/LightOJContestParser';
import { OldGoogleCodeJamContestParser } from './contest/OldGoogleCodeJamContestParser';
import { PEGJudgeContestParser } from './contest/PEGJudgeContestParser';
import { POJContestParser } from './contest/POJContestParser';
import { TimusContestParser } from './contest/TimusContestParser';
import { URIOnlineJudgeContestParser } from './contest/URIOnlineJudgeContestParser';
import { Parser } from './Parser';
import { A2OJProblemParser } from './problem/A2OJProblemParser';
import { AtCoderProblemParser } from './problem/AtCoderProblemParser';
import { CodeChefProblemParser } from './problem/CodeChefProblemParser';
import { CodeforcesProblemParser } from './problem/CodeforcesProblemParser';
import { COJProblemParser } from './problem/COJProblemParser';
import { CSAcademyProblemParser } from './problem/CSAcademyProblemParser';
import { DevSkillProblemParser } from './problem/DevSkillProblemParser';
import { DMOJProblemParser } from './problem/DMOJProblemParser';
import { EOlympProblemParser } from './problem/EOlympProblemParser';
import { FacebookHackerCupProblemParser } from './problem/FacebookHackerCupProblemParser';
import { HackerEarthCodeArenaParser } from './problem/HackerEarthCodeArenaParser';
import { HackerEarthProblemParser } from './problem/HackerEarthProblemParser';
import { HackerRankProblemParser } from './problem/HackerRankProblemParser';
import { HDUOnlineJudgeProblemParser } from './problem/HDUOnlineJudgeProblemParser';
import { JutgeProblemParser } from './problem/JutgeProblemParser';
import { KattisProblemParser } from './problem/KattisProblemParser';
import { LightOJProblemParser } from './problem/LightOJProblemParser';
import { NewGoogleCodeJamProblemParser } from './problem/NewGoogleCodeJamProblemParser';
import { OmegaUpProblemParser } from './problem/OmegaUpProblemParser';
import { PandaOnlineJudgeProblemParser } from './problem/PandaOnlineJudgeProblemParser';
import { PEGJudgeProblemParser } from './problem/PEGJudgeProblemParser';
import { POJProblemParser } from './problem/POJProblemParser';
import { SPOJProblemParser } from './problem/SPOJProblemParser';
import { TimusProblemParser } from './problem/TimusProblemParser';
import { TophProblemParser } from './problem/TophProblemParser';
import { URIOnlineJudgeProblemParser } from './problem/URIOnlineJudgeProblemParser';
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
