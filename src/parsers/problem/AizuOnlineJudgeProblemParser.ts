import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AizuOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://judge.u-aizu.ac.jp/onlinejudge/description.jsp*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Aizu Online Judge').setUrl(url);

    task.setName(elem.querySelector('#problemTitle').textContent);

    const breadcrumbContainer = elem.querySelector('#pwd');
    const breadcrumbs = [...breadcrumbContainer.querySelectorAll('.now')].map(el => el.textContent);
    breadcrumbs.push(breadcrumbContainer.childNodes[breadcrumbContainer.childNodes.length - 1].textContent);
    breadcrumbs.shift();

    task.setCategory(breadcrumbs.join(' - '));

    const timeLimitStr = elem.querySelector('#problemTimeLimit').textContent;
    task.setTimeLimit(parseInt(timeLimitStr, 10) * 1000);

    const memoryLimitStr = elem.querySelector('#problemMemoryLimit').textContent;
    task.setMemoryLimit(parseInt(memoryLimitStr, 10) / 1000);

    const blocks = [...elem.querySelectorAll('.description > pre')].filter(el => {
      const previousElement = el.previousElementSibling;

      if (!previousElement || previousElement.tagName !== 'H2') {
        return false;
      }

      const headerText = previousElement.textContent.toLowerCase();
      return ['ample input', 'ample output', '入力例', '出力例'].some(x => headerText.includes(x.toLowerCase()));
    });

    for (let i = 0; i < blocks.length; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
