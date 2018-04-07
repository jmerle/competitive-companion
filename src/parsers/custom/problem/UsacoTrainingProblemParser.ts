import * as $ from 'jquery';
import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { UsacoTask } from '../../../models/UsacoTask';
import { Test } from '../../../models/Test';

export class UsacoTrainingProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://train.usaco.org/usacoprob2*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $('<div/>').append(html);

      const taskId = $html.find('h3:contains("PROGRAM NAME")').text().substr(14);
      const taskName = $html.find('center > h1').text();
      const contestName = 'USACO Training';

      const input = $html.find('h3:contains("SAMPLE INPUT")').next('pre').text();
      const output = $html.find('h3:contains("SAMPLE OUTPUT")').next('pre').text();
      const test = new Test(input, output);

      resolve(new UsacoTask(taskId, taskName,  contestName, test));
    });
  }
}
