import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class DevSkillProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://devskill.com/CodingProblems/ViewProblem/*',
      'https://www.devskill.com/CodingProblems/ViewProblem/*',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const header = elem.querySelector('h1.page-title').childNodes[0].textContent.trim();
      task.setName(header.substr(header.indexOf(':') + 2));

      task.setGroup('DevSkill');

      const p = elem.querySelector('p.mark-down-html');

      if (p.childNodes.length === 1) {
        const lines = p.childNodes[0].textContent.trim().split('\n');

        const input: string[] = [];
        const output: string[] = [];

        const inputStart = lines.indexOf('Sample Input') + 3;
        for (let i = inputStart; i < lines.length && lines[i] !== ''; i++) {
          input.push(lines[i].trim());
        }

        const outputStart = lines.indexOf('Sample Output') + 3;
        for (let i = outputStart; i < lines.length && lines[i] !== ''; i++) {
          output.push(lines[i].trim());
        }

        task.addTest(new Test(input.join('\n'), output.join('\n')));
      } else {
        const input = [...elem.querySelectorAll('h2')]
          .find(el => el.textContent.includes('Sample Input'))
          .nextElementSibling
          .textContent;

        const output = [...elem.querySelectorAll('h2')]
          .find(el => el.textContent.includes('Sample Output'))
          .nextElementSibling
          .textContent;

        task.addTest(new Test(input, output));
      }

      const timeLimits = [...document.querySelectorAll('#limits > tbody > tr:not(:nth-child(1)) > td:nth-child(2)')]
        .map(el => parseFloat(el.textContent) * 1000);

      task.setTimeLimit(timeLimits.reduce((a, b) => a > b ? a : b));
      task.setMemoryLimit(1024);

      resolve(task.build());
    });
  }
}
