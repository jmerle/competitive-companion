import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ProjectEulerProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://projecteuler.net/problem=*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('ProjectEuler').setUrl(url);
    task.setName(elem.querySelector('#content > h2').textContent);
    task.setCategory('Project Euler');
    return task.build();
  }
}
