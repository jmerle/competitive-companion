import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class TimusOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['acm.timus.ru', 'timus.online', 'acm-judge.urfu.ru'].map(domain => `https://${domain}/problem.aspx*`);
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Timus Online Judge').setUrl(url);

    await task.setName(elem.querySelector('.problem_title').textContent);

    const limits = elem.querySelector('.problem_limits').textContent.trim();
    task.setTimeLimit(parseFloat(/([0-9.]+) (second|секунды)/.exec(limits)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) (MB|МБ)/.exec(limits)[1], 10));

    const source = elem.querySelector('.problem_source').textContent;
    if (/Problem Source: (.*)$/.test(source)) {
      task.setCategory(/Problem Source: (.*)$/.exec(source)[1]);
    }

    if (elem.querySelector('.sample tbody tr > td:nth-child(2)') !== null) {
      [...elem.querySelectorAll('.sample tbody tr')].slice(1).forEach(tr => {
        const columns = tr.querySelectorAll('td');
        task.addTest(columns[0].textContent, columns[1].textContent);
      });
    } else {
      const blocks = [...elem.querySelectorAll('.sample tbody tr pre')];
      for (let i = 0; i < blocks.length - 1; i += 2) {
        task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
      }
    }

    return task.build();
  }
}
