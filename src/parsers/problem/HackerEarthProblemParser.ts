import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class HackerEarthProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.hackerearth.com/*/algorithm/*',
      'https://www.hackerearth.com/*/approximate/*',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('#problem-title').textContent.trim());

      let groupSuffix: string[] = [];
      if (elem.querySelector('.timings') !== null) {
        groupSuffix = [elem.querySelector('.cover .title').textContent.trim()];
      } else {
        groupSuffix = [...elem.querySelectorAll('.breadcrumb a')].map(el => el.textContent).slice(1);
      }

      task.setGroup(['HackerEarth', ...groupSuffix].join(' - '));

      elem.querySelectorAll('.input-output-container').forEach(container => {
        const blocks = container.querySelectorAll('pre');
        const input = blocks[0].textContent.trim();
        const output = blocks[1].textContent.trim();

        task.addTest(new Test(input, output));
      });

      const guidelines = elem.querySelector('.problem-guidelines').textContent;
      task.setTimeLimit(parseFloat(/([0-9.]+) sec/.exec(guidelines)[1]) * 1000);
      task.setMemoryLimit(parseInt(/(\d+) MB/.exec(guidelines)[1]));

      resolve(task.build());
    });
  }
}
