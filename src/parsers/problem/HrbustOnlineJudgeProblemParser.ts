import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HrbustOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acm.hrbust.edu.cn/index.php*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/http:\/\/acm\.hrbust\.edu\.cn\/index\.php\?(.*)a=showProblem(.*)problem_id=(\d+)(.*)/];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const main = elem.querySelector('.right_table');

      task.setName(main.querySelector('.problem_mod_name').textContent);
      task.setGroup('Hrbust Online Judge');

      const limitsStr = main.querySelector('.problem_mod_info tr').textContent;
      task.setTimeLimit(parseInt(/(\d+) MS/.exec(limitsStr)[1], 10));
      task.setMemoryLimit(Math.floor(parseInt(/(\d+) K/.exec(limitsStr)[1], 10) / 1000));

      const inputs = [...main.querySelectorAll('.problem_mod_title')]
        .filter((x: Element) => x.textContent.toLowerCase() === 'sample input')
        .map((x: Element) => x.parentElement.nextElementSibling);

      const outputs = [...main.querySelectorAll('.problem_mod_title')]
        .filter((x: Element) => x.textContent.toLowerCase() === 'sample output')
        .map((x: Element) => x.parentElement.nextElementSibling);

      for (let i = 0; i < inputs.length && i < outputs.length; i++) {
        const input = [...inputs[i].querySelector('td').children]
          .map((x: any) => x.textContent.trim())
          .join('\n')
          .split('\n')
          .map(x => x.trim())
          .join('\n')
          .trim();

        const output = [...outputs[i].querySelector('td').children]
          .map((x: any) => x.textContent.trim())
          .join('\n')
          .split('\n')
          .map(x => x.trim())
          .join('\n')
          .trim();

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
