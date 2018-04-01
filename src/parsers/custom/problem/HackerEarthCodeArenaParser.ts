import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { HackerEarthProblemParser } from './HackerEarthProblemParser';
import { CustomTask } from '../../../models/CustomTask';

export class HackerEarthCodeArenaParser extends Parser {
  problemParser: Parser = new HackerEarthProblemParser();

  getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/codearena/ring/*/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      this.problemParser.parse(html).then(task => {
        const t = task as CustomTask;

        const id = /^https:\/\/www[.]hackerearth[.]com\/codearena\/ring\/(.*)\/(\?(.*))?$/.exec(window.location.href)[1];
        t.taskName = `CodeArena ${id}`;

        t.contestName = 'HackerEarth - CodeArena';

        resolve(t);
      });
    });
  }
}
