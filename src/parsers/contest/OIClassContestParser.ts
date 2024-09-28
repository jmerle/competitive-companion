import { OIClassProblemParser } from '../problem/OIClassProblemParser';
import { HydroContestParser } from './HydroContestParser';

export class OIClassContestParser extends HydroContestParser {
  protected problemParser = new OIClassProblemParser();

  protected domain = 'oiclass.com';
}
