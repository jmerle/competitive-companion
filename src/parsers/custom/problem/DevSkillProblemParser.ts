import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { htmlToElement } from '../../../utils';

export class DevSkillProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://devskill.com/CodingProblems/ViewProblem/*',
      'https://www.devskill.com/CodingProblems/ViewProblem/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const header = elem.querySelector('h1.page-title').childNodes[0].textContent.trim();
      const taskName = header.substr(header.indexOf(':') + 2);

      const contestName = 'DevSkill';

      const tests: Test[] = [];

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

        tests.push(new Test(input.join('\n'), output.join('\n')));
      } else {
        const input = [...elem.querySelectorAll('h2')]
          .find(el => el.textContent.includes('Sample Input'))
          .nextElementSibling
          .textContent;

        const output = [...elem.querySelectorAll('h2')]
          .find(el => el.textContent.includes('Sample Output'))
          .nextElementSibling
          .textContent;

        tests.push(new Test(input, output));
      }

      resolve(new CustomTask(taskName, contestName, tests, 1024));
    });
  }
}
