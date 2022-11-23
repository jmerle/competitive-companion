import { SimpleContestParser } from '../SimpleContestParser';

export abstract class HUSTOJSyzojContestParser extends SimpleContestParser {
  protected linkSelector = 'table.ui.selectable > tbody > tr > td:nth-child(2) > a';
}
