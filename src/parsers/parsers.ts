import { A2OnlineJudgeContestParser } from './contest/A2OnlineJudgeContestParser';
import { AtCoderContestParser } from './contest/AtCoderContestParser';
import { BaekjoonOnlineJudgeContestParser } from './contest/BaekjoonOnlineJudgeContestParser';
import { BeecrowdContestParser } from './contest/BeecrowdContestParser';
import { BUCTOJContestParser } from './contest/BUCTOJContestParser';
import { CodeChefContestParser } from './contest/CodeChefContestParser';
import { CodeforcesContestParser } from './contest/CodeforcesContestParser';
import { CodeMarshalContestParser } from './contest/CodeMarshalContestParser';
import { COJContestParser } from './contest/COJContestParser';
import { ContestHunterContestParser } from './contest/ContestHunterContestParser';
import { CSESContestParser } from './contest/CSESContestParser';
import { CSUACMOnlineJudgeContestParser } from './contest/CSUACMOnlineJudgeContestParser';
import { DMOJContestParser } from './contest/DMOJContestParser';
import { ECNUOnlineJudgeContestParser } from './contest/ECNUOnlineJudgeContestParser';
import { EolympContestParser } from './contest/EolympContestParser';
import { FZUOnlineJudgeContestParser } from './contest/FZUOnlineJudgeContestParser';
import { HackerEarthContestParser } from './contest/HackerEarthContestParser';
import { HackerRankContestParser } from './contest/HackerRankContestParser';
import { HDOJContestParser } from './contest/HDOJContestParser';
import { HDOJNewContestParser } from './contest/HDOJNewContestParser';
import { HihoCoderContestParser } from './contest/HihoCoderContestParser';
import { HKOIOnlineJudgeContestParser } from './contest/HKOIOnlineJudgeContestParser';
import { HydroContestParser } from './contest/HydroContestParser';
import { KattisContestParser } from './contest/KattisContestParser';
import { LibreOJContestParser } from './contest/LibreOJContestParser';
import { LuoguContestParser } from './contest/LuoguContestParser';
import { NOJContestParser } from './contest/NOJContestParser';
import { OpenJudgeContestParser } from './contest/OpenJudgeContestParser';
import { PEGJudgeContestParser } from './contest/PEGJudgeContestParser';
import { POJContestParser } from './contest/POJContestParser';
import { QDUOJContestParser } from './contest/QDUOJContestParser';
import { RoboContestContestParser } from './contest/RoboContestContestParser';
import { TimusOnlineJudgeContestParser } from './contest/TimusOnlineJudgeContestParser';
import { UOJContestParser } from './contest/UOJContestParser';
import { VirtualJudgeContestParser } from './contest/VirtualJudgeContestParser';
import { YandexContestParser } from './contest/YandexContestParser';
import { YukicoderContestParser } from './contest/YukicoderContestParser';
import { ZUFEOJContestParser } from './contest/ZUFEOJContestParser';
import { Parser } from './Parser';
import { A2OnlineJudgeProblemParser } from './problem/A2OnlineJudgeProblemParser';
import { ACMPProblemParser } from './problem/ACMPProblemParser';
import { AcWingProblemParser } from './problem/AcWingProblemParser';
import { AizuOnlineJudgeBetaProblemParser } from './problem/AizuOnlineJudgeBetaProblemParser';
import { AizuOnlineJudgeProblemParser } from './problem/AizuOnlineJudgeProblemParser';
import { AlgoZenithProblemParser } from './problem/AlgoZenithProblemParser';
import { AnarchyGolfProblemParser } from './problem/AnarchyGolfProblemParser';
import { AtCoderProblemParser } from './problem/AtCoderProblemParser';
import { BaekjoonOnlineJudgeProblemParser } from './problem/BaekjoonOnlineJudgeProblemParser';
import { BeecrowdProblemParser } from './problem/BeecrowdProblemParser';
import { BloombergCodeConProblemParser } from './problem/BloombergCodeConProblemParser';
import { BUCTOJProblemParser } from './problem/BUCTOJProblemParser';
import { CodeChefNewProblemParser } from './problem/CodeChefNewProblemParser';
import { CodeChefOldProblemParser } from './problem/CodeChefOldProblemParser';
import { CodeDrillsProblemParser } from './problem/CodeDrillsProblemParser';
import { CodeforcesProblemParser } from './problem/CodeforcesProblemParser';
import { CodeMarshalProblemParser } from './problem/CodeMarshalProblemParser';
import { COJProblemParser } from './problem/COJProblemParser';
import { ContestHunterProblemParser } from './problem/ContestHunterProblemParser';
import { CSAcademyProblemParser } from './problem/CSAcademyProblemParser';
import { CSESProblemParser } from './problem/CSESProblemParser';
import { CSUACMOnlineJudgeProblemParser } from './problem/CSUACMOnlineJudgeProblemParser';
import { DimikOJProblemParser } from './problem/DimikOJProblemParser';
import { DMOJProblemParser } from './problem/DMOJProblemParser';
import { ECNUOnlineJudgeProblemParser } from './problem/ECNUOnlineJudgeProblemParser';
import { EolympProblemParser } from './problem/EolympProblemParser';
import { FZUOnlineJudgeProblemParser } from './problem/FZUOnlineJudgeProblemParser';
import { GoogleCodingCompetitionsProblemParser } from './problem/GoogleCodingCompetitionsProblemParser';
import { HackerEarthCodeArenaParser } from './problem/HackerEarthCodeArenaParser';
import { HackerEarthProblemParser } from './problem/HackerEarthProblemParser';
import { HackerRankProblemParser } from './problem/HackerRankProblemParser';
import { HDOJNewProblemParser } from './problem/HDOJNewProblemParser';
import { HDOJProblemParser } from './problem/HDOJProblemParser';
import { HihoCoderProblemParser } from './problem/HihoCoderProblemParser';
import { HITOnlineJudgeProblemParser } from './problem/HITOnlineJudgeProblemParser';
import { HKOIOnlineJudgeProblemParser } from './problem/HKOIOnlineJudgeProblemParser';
import { HrbustOnlineJudgeProblemParser } from './problem/HrbustOnlineJudgeProblemParser';
import { HydroProblemParser } from './problem/HydroProblemParser';
import { JutgeProblemParser } from './problem/JutgeProblemParser';
import { KattisProblemParser } from './problem/KattisProblemParser';
import { LibraryCheckerOldProblemParser } from './problem/LibraryCheckerOldProblemParser';
import { LibraryCheckerProblemParser } from './problem/LibraryCheckerProblemParser';
import { LibreOJProblemParser } from './problem/LibreOJProblemParser';
import { LightOJProblemParser } from './problem/LightOJProblemParser';
import { LSYOIProblemParser } from './problem/LSYOIProblemParser';
import { LuoguProblemParser } from './problem/LuoguProblemParser';
import { MetaCodingCompetitionsProblemParser } from './problem/MetaCodingCompetitionsProblemParser';
import { MrJudgeProblemParser } from './problem/MrJudgeProblemParser';
import { MSKInformaticsProblemParser } from './problem/MSKInformaticsProblemParser';
import { NepsAcademyProblemParser } from './problem/NepsAcademyProblemParser';
import { NewtonSchoolProblemParser } from './problem/NewtonSchoolProblemParser';
import { NOJProblemParser } from './problem/NOJProblemParser';
import { NowCoderProblemParser } from './problem/NowCoderProblemParser';
import { OmegaUpProblemParser } from './problem/OmegaUpProblemParser';
import { OpenJudgeProblemParser } from './problem/OpenJudgeProblemParser';
import { OTOGProblemParser } from './problem/OTOGProblemParser';
import { PandaOnlineJudgeProblemParser } from './problem/PandaOnlineJudgeProblemParser';
import { PEGJudgeProblemParser } from './problem/PEGJudgeProblemParser';
import { POJProblemParser } from './problem/POJProblemParser';
import { PTAProblemParser } from './problem/PTAProblemParser';
import { QDUOJProblemParser } from './problem/QDUOJProblemParser';
import { RoboContestProblemParser } from './problem/RoboContestProblemParser';
import { SDUTOnlineJudgeProblemParser } from './problem/SDUTOnlineJudgeProblemParser';
import { SortMeProblemParser } from './problem/SortMeProblemParser';
import { SPOJProblemParser } from './problem/SPOJProblemParser';
import { SSOIERProblemParser } from './problem/SSOIERProblemParser';
import { TheJobOverflowProblemParser } from './problem/TheJobOverflowProblemParser';
import { TimusOnlineJudgeProblemParser } from './problem/TimusOnlineJudgeProblemParser';
import { TLXProblemParser } from './problem/TLXProblemParser';
import { TophProblemParser } from './problem/TophProblemParser';
import { UDebugProblemParser } from './problem/UDebugProblemParser';
import { UOJProblemParser } from './problem/UOJProblemParser';
import { USACOProblemParser } from './problem/USACOProblemParser';
import { USACOTrainingProblemParser } from './problem/USACOTrainingProblemParser';
import { UVaOnlineJudgeProblemParser } from './problem/UVaOnlineJudgeProblemParser';
import { VirtualJudgeProblemParser } from './problem/VirtualJudgeProblemParser';
import { XXMProblemParser } from './problem/XXMProblemParser';
import { YandexProblemParser } from './problem/YandexProblemParser';
import { YukicoderProblemParser } from './problem/YukicoderProblemParser';
import { ZOJProblemParser } from './problem/ZOJProblemParser';
import { ZUFEOJProblemParser } from './problem/ZUFEOJProblemParser';

export const parsers: Parser[] = [
  new A2OnlineJudgeProblemParser(),
  new A2OnlineJudgeContestParser(),

  new ACMPProblemParser(),

  new AcWingProblemParser(),

  new AizuOnlineJudgeProblemParser(),
  new AizuOnlineJudgeBetaProblemParser(),

  new AlgoZenithProblemParser(),

  new AnarchyGolfProblemParser(),

  new AtCoderProblemParser(),
  new AtCoderContestParser(),

  new BaekjoonOnlineJudgeProblemParser(),
  new BaekjoonOnlineJudgeContestParser(),

  new BeecrowdProblemParser(),
  new BeecrowdContestParser(),

  new BloombergCodeConProblemParser(),

  new BUCTOJProblemParser(),
  new BUCTOJContestParser(),

  new CodeChefNewProblemParser(),
  new CodeChefOldProblemParser(),
  new CodeChefContestParser(),

  new CodeDrillsProblemParser(),

  new CodeforcesProblemParser(),
  new CodeforcesContestParser(),

  new CodeMarshalProblemParser(),
  new CodeMarshalContestParser(),

  new COJProblemParser(),
  new COJContestParser(),

  new ContestHunterProblemParser(),
  new ContestHunterContestParser(),

  new CSAcademyProblemParser(),

  new CSESProblemParser(),
  new CSESContestParser(),

  new CSUACMOnlineJudgeProblemParser(),
  new CSUACMOnlineJudgeContestParser(),

  new DimikOJProblemParser(),

  new DMOJProblemParser(),
  new DMOJContestParser(),

  new ECNUOnlineJudgeProblemParser(),
  new ECNUOnlineJudgeContestParser(),

  new EolympProblemParser(),
  new EolympContestParser(),

  new FZUOnlineJudgeProblemParser(),
  new FZUOnlineJudgeContestParser(),

  new GoogleCodingCompetitionsProblemParser(),

  new HackerEarthProblemParser(),
  new HackerEarthCodeArenaParser(),
  new HackerEarthContestParser(),

  new HackerRankProblemParser(),
  new HackerRankContestParser(),

  new HDOJNewProblemParser(),
  new HDOJProblemParser(),
  new HDOJNewContestParser(),
  new HDOJContestParser(),

  new HITOnlineJudgeProblemParser(),

  new HihoCoderProblemParser(),
  new HihoCoderContestParser(),

  new HKOIOnlineJudgeProblemParser(),
  new HKOIOnlineJudgeContestParser(),

  new HrbustOnlineJudgeProblemParser(),

  new HydroProblemParser(),
  new HydroContestParser(),

  new JutgeProblemParser(),

  new KattisProblemParser(),
  new KattisContestParser(),

  new LibraryCheckerProblemParser(),
  new LibraryCheckerOldProblemParser(),

  new LibreOJProblemParser(),
  new LibreOJContestParser(),

  new LightOJProblemParser(),

  new LSYOIProblemParser(),

  new LuoguProblemParser(),
  new LuoguContestParser(),

  new MetaCodingCompetitionsProblemParser(),

  new MrJudgeProblemParser(),

  new MSKInformaticsProblemParser(),

  new NepsAcademyProblemParser(),

  new NewtonSchoolProblemParser(),

  new NOJProblemParser(),
  new NOJContestParser(),

  new NowCoderProblemParser(),

  new OmegaUpProblemParser(),

  new OpenJudgeProblemParser(),
  new OpenJudgeContestParser(),

  new OTOGProblemParser(),

  new PandaOnlineJudgeProblemParser(),

  new PEGJudgeProblemParser(),
  new PEGJudgeContestParser(),

  new POJProblemParser(),
  new POJContestParser(),

  new PTAProblemParser(),

  new QDUOJProblemParser(),
  new QDUOJContestParser(),

  new RoboContestProblemParser(),
  new RoboContestContestParser(),

  new SDUTOnlineJudgeProblemParser(),

  new SortMeProblemParser(),

  new SPOJProblemParser(),

  new SSOIERProblemParser(),

  new TheJobOverflowProblemParser(),

  new TimusOnlineJudgeProblemParser(),
  new TimusOnlineJudgeContestParser(),

  new TLXProblemParser(),

  new TophProblemParser(),

  new UDebugProblemParser(),

  new UOJProblemParser(),
  new UOJContestParser(),

  new USACOProblemParser(),
  new USACOTrainingProblemParser(),

  new UVaOnlineJudgeProblemParser(),

  new VirtualJudgeProblemParser(),
  new VirtualJudgeContestParser(),

  new XXMProblemParser(),

  new YandexProblemParser(),
  new YandexContestParser(),

  new YukicoderProblemParser(),
  new YukicoderContestParser(),

  new ZOJProblemParser(),

  new ZUFEOJProblemParser(),
  new ZUFEOJContestParser(),
];
