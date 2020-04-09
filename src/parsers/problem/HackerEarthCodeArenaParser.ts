import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { Parser } from '../Parser';
import { HackerEarthProblemParser } from './HackerEarthProblemParser';

export class HackerEarthCodeArenaParser extends Parser {
  public problemParser: Parser = new HackerEarthProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/codearena/ring/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const task = (await this.problemParser.parse(url, html)) as Task;

    const id = /^https:\/\/www[.]hackerearth[.]com\/codearena\/ring\/(.*)\/(\?(.*))?$/.exec(url)[1];
    task.name = `CodeArena ${id}`;
    task.group = 'HackerEarth - CodeArena';

    return task;
  }
}
