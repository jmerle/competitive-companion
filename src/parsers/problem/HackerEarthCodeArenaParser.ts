import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { HackerEarthProblemParser } from './HackerEarthProblemParser';
import { Task } from '../../models/Task';

export class HackerEarthCodeArenaParser extends Parser {
  problemParser: Parser = new HackerEarthProblemParser();

  getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/codearena/ring/*/*'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      this.problemParser.parse(url, html).then(task => {
        const t = task as Task;

        const id = /^https:\/\/www[.]hackerearth[.]com\/codearena\/ring\/(.*)\/(\?(.*))?$/.exec(window.location.href)[1];
        t.name = `CodeArena ${id}`;

        t.group = 'HackerEarth - CodeArena';

        resolve(t);
      });
    });
  }
}
