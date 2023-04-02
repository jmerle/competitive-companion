import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HDOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://acm.hdu.edu.cn/showproblem.php*', 'https://acm.hdu.edu.cn/contests/contest_showproblem.php*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HDOJ').setUrl(url);

    const contentElem = elem.querySelector('tr:nth-child(4)') || elem.querySelector('#contest_nav + div');

    task.setName(contentElem.querySelector('h1').textContent);

    task.setTimeLimit(parseInt(/Time Limit: (\d+)/.exec(html)[1], 10));
    task.setMemoryLimit(parseInt(/Memory Limit: (\d+)/.exec(html)[1], 10) / 1000);

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

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i], outputs[i]);
    }

    return task.build();
  }
}
