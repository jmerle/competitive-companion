import { SimpleContestParser } from '../SimpleContestParser';
import { KilonovaProblemParser } from '../problem/KilonovaProblemParser';

export class KilonovaContestParser extends SimpleContestParser {
    protected linkSelector = 'div.reset-list > ul > li > a[href^="/"]';
    protected problemParser = new KilonovaProblemParser();

    public getMatchPatterns(): string[] {
        return [
            'https://kilonova.ro/*problems/*',
        ];
    }


}
