import { SimpleContestParser } from '../SimpleContestParser';
import { KilonovaProblemParser } from '../problem/KilonovaProblemParser';

export class KilonovaContestParser extends SimpleContestParser {
    protected linkSelector = 'div.reset-list > ul > li > a[href^="/contests"]';
    protected problemParser = new KilonovaProblemParser();

    public getMatchPatterns(): string[] {
        return [
            'https://kilonova.ro/problems/*',
            'https://kilonova.ro/contests/*/problems/*',
        ];
    }

    public getRegularExpressions(): RegExp[] {
        return [
            /https:\/\/kilonova[.]ro\/contests\/(\d+)\/problems\/(\d+)$/,
            /https:\/\/kilonova[.]ro\/problems\/(\d+)$/
        ];
    }


}
