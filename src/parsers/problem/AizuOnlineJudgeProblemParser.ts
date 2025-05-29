import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AizuOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://judge.u-aizu.ac.jp/onlinejudge/description.jsp*',
      'https://onlinejudge.u-aizu.ac.jp/courses/*',
      'https://onlinejudge.u-aizu.ac.jp/challenges/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Aizu Online Judge').setUrl(url);

    task.setName(elem.querySelector('h1').textContent);

    let breadcrumbs: string[];
    let limitsStr: string;
    let unfilteredBlocks: NodeListOf<Element>;
    if (url.includes('//judge')) {
      const breadcrumbContainer = elem.querySelector('#pwd');
      breadcrumbs = [...breadcrumbContainer.querySelectorAll('.now')].map(el => el.textContent);
      breadcrumbs.push(breadcrumbContainer.childNodes[breadcrumbContainer.childNodes.length - 1].textContent);
      breadcrumbs.shift();

      limitsStr = elem.querySelector('#pageinfo span.text-red3').textContent;
      unfilteredBlocks = elem.querySelectorAll('.description > pre');
    } else {
      breadcrumbs = [...elem.querySelectorAll('.breadcrumbs .link')]
        .map(el => el.textContent.trim())
        .map(text => text[0].toUpperCase() + text.substring(1));
      breadcrumbs.shift();

      limitsStr = elem.querySelector('.problemInfo').textContent;
      unfilteredBlocks = elem.querySelectorAll('.problemBody > pre');
    }

    task.setCategory(breadcrumbs.join(' - '));

    task.setTimeLimit(parseInt(/(\d+) sec/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) KB/.exec(limitsStr)[1]) / 1024);

    const blocks = [...unfilteredBlocks].filter(el => {
      const previousElement = el.previousElementSibling;

      if (!previousElement || previousElement.tagName !== 'H2') {
        return false;
      }

      const headerText = previousElement.textContent.toLowerCase();
      return ['ample input', 'ample output', '力例', '入力例', '出力例'].some(x =>
        headerText.includes(x.toLowerCase()),
      );
    });

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
