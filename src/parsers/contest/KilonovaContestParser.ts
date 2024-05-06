import { SimpleContestParser } from '../SimpleContestParser';
import { KilonovaProblemParser } from '../problem/KilonovaProblemParser';

export class KilonovaContestParser extends SimpleContestParser {
    protected linkSelector = 'details.segment-panel > div.reset-list > ul > li > a';
    protected problemParser = new KilonovaProblemParser();

    public getMatchPatterns(): string[] {
        return [
            'https://kilonova.ro/problems/*',
            'https://kilonova.ro/contests/*/problems/*',
        ];
    }

}
