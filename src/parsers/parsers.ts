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
import { HDOJContestParser } from './contest/HDOJContestParser';
import { HihoCoderContestParser } from './contest/HihoCoderContestParser';
import { KattisContestParser } from './contest/KattisContestParser';
import { LibreOJContestParser } from './contest/LibreOJContestParser';
import { PEGJudgeContestParser } from './contest/PEGJudgeContestParser';
import { POJContestParser } from './contest/POJContestParser';
import { QDUOJContestParser } from './contest/QDUOJContestParser';
import { TimusOnlineJudgeContestParser } from './contest/TimusOnlineJudgeContestParser';
import { UOJContestParser } from './contest/UOJContestParser';
import { URIOnlineJudgeContestParser } from './contest/URIOnlineJudgeContestParser';
import { YukicoderContestParser } from './contest/YukicoderContestParser';
import { Parser } from './Parser';
import { ACMPProblemParser } from './problem/ACMPProblemParser';
import { AcWingProblemParser } from './problem/AcWingProblemParser';
import { AizuOnlineJudgeBetaProblemParser } from './problem/AizuOnlineJudgeBetaProblemParser';
import { AizuOnlineJudgeProblemParser } from './problem/AizuOnlineJudgeProblemParser';
import { AnarchyGolfProblemParser } from './problem/AnarchyGolfProblemParser';
import { AtCoderProblemParser } from './problem/AtCoderProblemParser';
import { BaekjoonOnlineJudgeProblemParser } from './problem/BaekjoonOnlineJudgeProblemParser';
import { BloombergCodeConProblemParser } from './problem/BloombergCodeConProblemParser';
import { CodeChefProblemParser } from './problem/CodeChefProblemParser';
import { CodeDrillsProblemParser } from './problem/CodeDrillsProblemParser';
import { CodeforcesProblemParser } from './problem/CodeforcesProblemParser';
import { CodeMarshalProblemParser } from './problem/CodeMarshalProblemParser';
import { COJProblemParser } from './problem/COJProblemParser';
import { ContestHunterProblemParser } from './problem/ContestHunterProblemParser';
import { CSAcademyProblemParser } from './problem/CSAcademyProblemParser';
import { CSESProblemParser } from './problem/CSESProblemParser';
import { CSUACMOnlineJudgeProblemParser } from './problem/CSUACMOnlineJudgeProblemParser';
import { DevSkillProblemParser } from './problem/DevSkillProblemParser';
import { DMOJProblemParser } from './problem/DMOJProblemParser';
import { ECNUOnlineJudgeProblemParser } from './problem/ECNUOnlineJudgeProblemParser';
import { EOlympProblemParser } from './problem/EOlympProblemParser';
import { FacebookCodingCompetitionsProblemParser } from './problem/FacebookCodingCompetitionsProblemParser';
import { FZUOnlineJudgeProblemParser } from './problem/FZUOnlineJudgeProblemParser';
import { GoogleCodingCompetitionsProblemParser } from './problem/GoogleCodingCompetitionsProblemParser';
import { HackerEarthCodeArenaParser } from './problem/HackerEarthCodeArenaParser';
import { HackerEarthProblemParser } from './problem/HackerEarthProblemParser';
import { HackerRankProblemParser } from './problem/HackerRankProblemParser';
import { HDOJProblemParser } from './problem/HDOJProblemParser';
import { HihoCoderProblemParser } from './problem/HihoCoderProblemParser';
import { HITOnlineJudgeProblemParser } from './problem/HITOnlineJudgeProblemParser';
import { HrbustOnlineJudgeProblemParser } from './problem/HrbustOnlineJudgeProblemParser';
import { JutgeProblemParser } from './problem/JutgeProblemParser';
import { KattisProblemParser } from './problem/KattisProblemParser';
import { LibraryCheckerProblemParser } from './problem/LibraryCheckerProblemParser';
import { LibreOJProblemParser } from './problem/LibreOJProblemParser';
import { LightOJProblemParser } from './problem/LightOJProblemParser';
import { LuoguProblemParser } from './problem/LuoguProblemParser';
import { MrJudgeProblemParser } from './problem/MrJudgeProblemParser';
import { MSKInformaticsProblemParser } from './problem/MSKInformaticsProblemParser';
import { NepsAcademyProblemParser } from './problem/NepsAcademyProblemParser';
import { NowCoderProblemParser } from './problem/NowCoderProblemParser';
import { OldLibraryCheckerProblemParser } from './problem/OldLibraryCheckerProblemParser';
import { OmegaUpProblemParser } from './problem/OmegaUpProblemParser';
import { PandaOnlineJudgeProblemParser } from './problem/PandaOnlineJudgeProblemParser';
import { PEGJudgeProblemParser } from './problem/PEGJudgeProblemParser';
import { POJProblemParser } from './problem/POJProblemParser';
import { QDUOJProblemParser } from './problem/QDUOJProblemParser';
import { SPOJProblemParser } from './problem/SPOJProblemParser';
import { SSOIERProblemParser } from './problem/SSOIERProblemParser';
import { TimusOnlineJudgeProblemParser } from './problem/TimusOnlineJudgeProblemParser';
import { TLXProblemParser } from './problem/TLXProblemParser';
import { TophProblemParser } from './problem/TophProblemParser';
import { UOJProblemParser } from './problem/UOJProblemParser';
import { URIOnlineJudgeProblemParser } from './problem/URIOnlineJudgeProblemParser';
import { USACOProblemParser } from './problem/USACOProblemParser';
import { USACOTrainingProblemParser } from './problem/USACOTrainingProblemParser';
import { UVaOnlineJudgeProblemParser } from './problem/UVaOnlineJudgeProblemParser';
import { VirtualJudgeProblemParser } from './problem/VirtualJudgeProblemParser';
import { XXMProblemParser } from './problem/XXMProblemParser';
import { YandexProblemParser } from './problem/YandexProblemParser';
import { YukicoderProblemParser } from './problem/YukicoderProblemParser';

export const parsers: Parser[] = [
  new ACMPProblemParser(),

  new AcWingProblemParser(),

  new AizuOnlineJudgeProblemParser(),
  new AizuOnlineJudgeBetaProblemParser(),

  new AnarchyGolfProblemParser(),

  new AtCoderProblemParser(),
  new AtCoderContestParser(),

  new BaekjoonOnlineJudgeProblemParser(),
  new BaekjoonOnlineJudgeContestParser(),

  new BloombergCodeConProblemParser(),

  new CodeChefProblemParser(),
  new CodeChefContestParser(),

  new CodeDrillsProblemParser(),

  new CodeforcesProblemParser(),
  new CodeforcesContestParser(),

  new CodeMarshalProblemParser(),
  new CodeMarshalContestParser(),

  new COJProblemParser(),
  new COJContestParser(),

  new ContestHunterProblemParser(),

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

  new FacebookCodingCompetitionsProblemParser(),

  new FZUOnlineJudgeProblemParser(),
  new FZUOnlineJudgeContestParser(),

  new GoogleCodingCompetitionsProblemParser(),

  new HackerEarthProblemParser(),
  new HackerEarthCodeArenaParser(),
  new HackerEarthContestParser(),

  new HackerRankProblemParser(),
  new HackerRankContestParser(),

  new HDOJProblemParser(),
  new HDOJContestParser(),

  new HITOnlineJudgeProblemParser(),

  new HihoCoderProblemParser(),
  new HihoCoderContestParser(),

  new HrbustOnlineJudgeProblemParser(),

  new JutgeProblemParser(),

  new KattisProblemParser(),
  new KattisContestParser(),

  new LibraryCheckerProblemParser(),
  new OldLibraryCheckerProblemParser(),

  new LibreOJProblemParser(),
  new LibreOJContestParser(),

  new LightOJProblemParser(),

  new LuoguProblemParser(),

  new MrJudgeProblemParser(),

  new MSKInformaticsProblemParser(),

  new NepsAcademyProblemParser(),

  new NowCoderProblemParser(),

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

  new TLXProblemParser(),

  new TophProblemParser(),

  new UOJProblemParser(),
  new UOJContestParser(),

  new URIOnlineJudgeProblemParser(),
  new URIOnlineJudgeContestParser(),

  new USACOProblemParser(),
  new USACOTrainingProblemParser(),

  new UVaOnlineJudgeProblemParser(),

  new VirtualJudgeProblemParser(),

  new XXMProblemParser(),

  new YandexProblemParser(),

  new YukicoderProblemParser(),
  new YukicoderContestParser(),
];
