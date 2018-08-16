import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { Parser } from '../Parser';
import { HackerEarthProblemParser } from './HackerEarthProblemParser';

export class HackerEarthCodeArenaParser extends Parser {
  public problemParser: Parser = new HackerEarthProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/codearena/ring/*/*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      this.problemParser.parse(url, html).then(task => {
        const t = task as Task;

        const id = /^https:\/\/www[.]hackerearth[.]com\/codearena\/ring\/(.*)\/(\?(.*))?$/.exec(
          window.location.href,
        )[1];
        t.name = `CodeArena ${id}`;

        t.group = 'HackerEarth - CodeArena';

        resolve(t);
      });
    });
  }
}
