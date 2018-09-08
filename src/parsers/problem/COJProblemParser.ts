import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class COJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://coj.uci.cu/24h/problem.xhtml*',
      'http://coj.uci.cu/contest/cproblem.xhtml*',
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const content = elem.querySelector('.postcontent');

      task.setName(
        content.querySelector('h3.text-center > b').textContent.split('- ')[1],
      );

      const group = ['COJ'];

      const contestTitleElem = elem.querySelector(
        'h2.postheader > a.linkheader',
      );

      if (contestTitleElem !== null) {
        group.push(contestTitleElem.textContent);
      }

      task.setGroup(group.join(' - '));

      const limitsStr = content.querySelector('.limit.lang2').textContent;

      task.setTimeLimit(
        parseInt(/Total Time: (\d+) MS/.exec(limitsStr)[1], 10),
      );

      task.setMemoryLimit(parseInt(/Memory: (\d+) MB/.exec(limitsStr)[1], 10));

      const inputs = [...elem.querySelectorAll('h4.text-primary')]
        .filter(el => el.textContent.trim().startsWith('Sample input'))
        .map(el => el.nextElementSibling);

      const outputs = [...elem.querySelectorAll('h4.text-primary')]
        .filter(el => el.textContent.trim().startsWith('Sample output'))
        .map(el => el.nextElementSibling);

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i].innerHTML;
        const output = outputs[i].innerHTML;

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
