import { AtCoderContestParser } from './contest/AtCoderContestParser';
import { BaekjoonOnlineJudgeContestParser } from './contest/BaekjoonOnlineJudgeContestParser';
import { CodeChefContestParser } from './contest/CodeChefContestParser';
import { CodeforcesContestParser } from './contest/CodeforcesContestParser';
import { CodeMarshalContestParser } from './contest/CodeMarshalContestParser';
import { COJContestParser } from './contest/COJContestParser';
import { CSESContestParser } from './contest/CSESContestParser';
import { CSUACMOnlineJudgeContestParser } from './contest/CSUACMOnlineJudgeContestParser';
import { DevSkillContestParser } from './contest/DevSkillContestParser';
import { DMOJContestParser } from './contest/DMOJContestParser';
import { ECNUOnlineJudgeContestParser } from './contest/ECNUOnlineJudgeContestParser';
import { EOlympContestParser } from './contest/EOlympContestParser';
import { FZUOnlineJudgeContestParser } from './contest/FZUOnlineJudgeContestParser';
import { HackerEarthContestParser } from './contest/HackerEarthContestParser';
import { HackerRankContestParser } from './contest/HackerRankContestParser';
import { HDUOnlineJudgeContestParser } from './contest/HDUOnlineJudgeContestParser';
import { HihoCoderContestParser } from './contest/HihoCoderContestParser';
import { KattisContestParser } from './contest/KattisContestParser';
import { LibreOJContestParser } from './contest/LibreOJContestParser';
import { LightOJContestParser } from './contest/LightOJContestParser';
import { OldGoogleCodeJamContestParser } from './contest/OldGoogleCodeJamContestParser';
import { PEGJudgeContestParser } from './contest/PEGJudgeContestParser';
import { POJContestParser } from './contest/POJContestParser';
import { QDUOJContestParser } from './contest/QDUOJContestParser';
import { TimusOnlineJudgeContestParser } from './contest/TimusOnlineJudgeContestParser';
import { UOJContestParser } from './contest/UOJContestParser';
import { URIOnlineJudgeContestParser } from './contest/URIOnlineJudgeContestParser';
import { Parser } from './Parser';
import { ACMPProblemParser } from './problem/ACMPProblemParser';
import { AtCoderProblemParser } from './problem/AtCoderProblemParser';
import { BaekjoonOnlineJudgeProblemParser } from './problem/BaekjoonOnlineJudgeProblemParser';
import { BloombergCodeConProblemParser } from './problem/BloombergCodeConProblemParser';
import { CodeChefProblemParser } from './problem/CodeChefProblemParser';
import { CodeforcesProblemParser } from './problem/CodeforcesProblemParser';
import { CodeMarshalProblemParser } from './problem/CodeMarshalProblemParser';
import { COJProblemParser } from './problem/COJProblemParser';
import { CSAcademyProblemParser } from './problem/CSAcademyProblemParser';
import { CSESProblemParser } from './problem/CSESProblemParser';
import { CSUACMOnlineJudgeProblemParser } from './problem/CSUACMOnlineJudgeProblemParser';
import { DevSkillProblemParser } from './problem/DevSkillProblemParser';
import { DMOJProblemParser } from './problem/DMOJProblemParser';
import { ECNUOnlineJudgeProblemParser } from './problem/ECNUOnlineJudgeProblemParser';
import { EOlympProblemParser } from './problem/EOlympProblemParser';
import { FacebookHackerCupProblemParser } from './problem/FacebookHackerCupProblemParser';
import { FZUOnlineJudgeProblemParser } from './problem/FZUOnlineJudgeProblemParser';
import { GoogleCodingCompetitionsProblemParser } from './problem/GoogleCodingCompetitionsProblemParser';
import { HackerEarthCodeArenaParser } from './problem/HackerEarthCodeArenaParser';
import { HackerEarthProblemParser } from './problem/HackerEarthProblemParser';
import { HackerRankProblemParser } from './problem/HackerRankProblemParser';
import { HDUOnlineJudgeProblemParser } from './problem/HDUOnlineJudgeProblemParser';
import { HihoCoderProblemParser } from './problem/HihoCoderProblemParser';
import { HITOnlineJudgeProblemParser } from './problem/HITOnlineJudgeProblemParser';
import { HrbustOnlineJudgeProblemParser } from './problem/HrbustOnlineJudgeProblemParser';
import { JutgeProblemParser } from './problem/JutgeProblemParser';
import { KattisProblemParser } from './problem/KattisProblemParser';
import { LibreOJProblemParser } from './problem/LibreOJProblemParser';
import { LightOJProblemParser } from './problem/LightOJProblemParser';
import { LuoguProblemParser } from './problem/LuoguProblemParser';
import { MrJudgeProblemParser } from './problem/MrJudgeProblemParser';
import { MSKInformaticsProblemParser } from './problem/MSKInformaticsProblemParser';
import { NowCoderProblemParser } from './problem/NowCoderProblemParser';
import { OmegaUpProblemParser } from './problem/OmegaUpProblemParser';
import { PandaOnlineJudgeProblemParser } from './problem/PandaOnlineJudgeProblemParser';
import { PEGJudgeProblemParser } from './problem/PEGJudgeProblemParser';
import { POJProblemParser } from './problem/POJProblemParser';
import { QDUOJProblemParser } from './problem/QDUOJProblemParser';
import { SPOJProblemParser } from './problem/SPOJProblemParser';
import { SSOIERProblemParser } from './problem/SSOIERProblemParser';
import { TimusOnlineJudgeProblemParser } from './problem/TimusOnlineJudgeProblemParser';
import { TophProblemParser } from './problem/TophProblemParser';
import { UOJProblemParser } from './problem/UOJProblemParser';
import { URIOnlineJudgeProblemParser } from './problem/URIOnlineJudgeProblemParser';
import { USACOProblemParser } from './problem/USACOProblemParser';
import { USACOTrainingProblemParser } from './problem/USACOTrainingProblemParser';
import { UVaOnlineJudgeProblemParser } from './problem/UVaOnlineJudgeProblemParser';
import { VirtualJudgeProblemParser } from './problem/VirtualJudgeProblemParser';
import { YandexProblemParser } from './problem/YandexProblemParser';

export const parsers: Parser[] = [
  new ACMPProblemParser(),

  new AtCoderProblemParser(),
  new AtCoderContestParser(),

  new BaekjoonOnlineJudgeProblemParser(),
  new BaekjoonOnlineJudgeContestParser(),

  new BloombergCodeConProblemParser(),

  new CodeChefProblemParser(),
  new CodeChefContestParser(),

  new CodeforcesProblemParser(),
  new CodeforcesContestParser(),

  new CodeMarshalProblemParser(),
  new CodeMarshalContestParser(),

  new COJProblemParser(),
  new COJContestParser(),

  new CSAcademyProblemParser(),

  new CSESProblemParser(),
  new CSESContestParser(),

  new CSUACMOnlineJudgeProblemParser(),
  new CSUACMOnlineJudgeContestParser(),

  new DevSkillProblemParser(),
  new DevSkillContestParser(),

  new DMOJProblemParser(),
  new DMOJContestParser(),

  new ECNUOnlineJudgeProblemParser(),
  new ECNUOnlineJudgeContestParser(),

  new EOlympProblemParser(),
  new EOlympContestParser(),

  new FacebookHackerCupProblemParser(),

  new FZUOnlineJudgeProblemParser(),
  new FZUOnlineJudgeContestParser(),

  new GoogleCodingCompetitionsProblemParser(),

  new HackerEarthProblemParser(),
  new HackerEarthCodeArenaParser(),
  new HackerEarthContestParser(),

  new HackerRankProblemParser(),
  new HackerRankContestParser(),

  new HDUOnlineJudgeProblemParser(),
  new HDUOnlineJudgeContestParser(),

  new HITOnlineJudgeProblemParser(),

  new HihoCoderProblemParser(),
  new HihoCoderContestParser(),

  new HrbustOnlineJudgeProblemParser(),

  new JutgeProblemParser(),

  new KattisProblemParser(),
  new KattisContestParser(),

  new LibreOJProblemParser(),
  new LibreOJContestParser(),

  new LightOJProblemParser(),
  new LightOJContestParser(),

  new LuoguProblemParser(),

  new MrJudgeProblemParser(),

  new MSKInformaticsProblemParser(),

  new NowCoderProblemParser(),

  new OldGoogleCodeJamContestParser(),

  new OmegaUpProblemParser(),

  new PandaOnlineJudgeProblemParser(),

  new PEGJudgeProblemParser(),
  new PEGJudgeContestParser(),

  new POJProblemParser(),
  new POJContestParser(),

  new QDUOJProblemParser(),
  new QDUOJContestParser(),

  new SPOJProblemParser(),

  new SSOIERProblemParser(),

  new TimusOnlineJudgeProblemParser(),
  new TimusOnlineJudgeContestParser(),

  new TophProblemParser(),

  new UOJProblemParser(),
  new UOJContestParser(),

  new URIOnlineJudgeProblemParser(),
  new URIOnlineJudgeContestParser(),

  new USACOProblemParser(),
  new USACOTrainingProblemParser(),

  new UVaOnlineJudgeProblemParser(),

  new VirtualJudgeProblemParser(),

  new YandexProblemParser(),
];
