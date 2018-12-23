import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HDUOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acm.hdu.edu.cn/showproblem.php*', 'http://acm.hdu.edu.cn/contests/contest_showproblem.php*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const contentElem = elem.querySelector('tr:nth-child(4)') || elem.querySelector('#contest_nav + div');

      task.setName(contentElem.querySelector('h1').textContent);
      task.setGroup('HDU Online Judge');

      task.setTimeLimit(parseInt(/Time Limit: (\d+)/.exec(html)[1], 10));
      task.setMemoryLimit(Math.floor(parseInt(/Memory Limit: (\d+)/.exec(html)[1], 10) / 1000));

      const inputs = [...contentElem.querySelectorAll('div')]
        .filter(el => el.textContent.trim().startsWith('Sample Input'))
        .map(el => el.nextElementSibling.querySelector('pre'))
        .map(pre => {
          const dataElem = pre.querySelector('div') || pre;
          return [...dataElem.childNodes].reduce((a, b) => a + (b.nodeType === 3 ? b.textContent : ''), '');
        });

      const outputs = [...contentElem.querySelectorAll('div')]
        .filter(el => el.textContent.trim().startsWith('Sample Output'))
        .map(el => el.nextElementSibling.querySelector('pre'))
        .map(pre => {
          const dataElem = pre.querySelector('div') || pre;
          return [...dataElem.childNodes].reduce((a, b) => a + (b.nodeType === 3 ? b.textContent : ''), '');
        });

      for (let i = 0; i < inputs.length; i++) {
        task.addTest(inputs[i].trim(), outputs[i].trim());
      }

      resolve(task.build());
    });
  }
}
