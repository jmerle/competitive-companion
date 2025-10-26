import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';

interface ProblemStub {
  url: string;
  title: string;
  contestTitle: string;
}

export class CSGOJContestParser extends ContestParser<ProblemStub> {
  public getMatchPatterns(): string[] {
    return [
      'https://acm.sztu.edu.cn/*/*/problemset?*',
      'http://acm.sztu.edu.cn:40080/*/*/problemset?*',
      'http://acm.sztu.edu.cn:50100/*/*/problemset?*',
      'https://cpc.csgrandeur.cn/*/contest/problemset?*',
    ];
  }

  protected getTasksToParse(): Promise<ProblemStub[]> {
    const contestTitleSelector = 'body > main > h1:nth-child(2)';
    const candidateSelector = 'body > main > div:nth-child(1) > div > div > h1';
    const linksSelector = 'div.fixed-table-body tbody tr td:nth-child(3) a';

    const contestTitleElem = document.querySelector(contestTitleSelector) || document.querySelector(candidateSelector);
    const links = document.querySelectorAll(linksSelector);

    if (!contestTitleElem || links.length === 0) {
      return Promise.resolve([]);
    }

    const contestTitle = contestTitleElem.textContent.trim().replace(/^\d+:\s*/, '');

    const stubs = [...links].map(link => {
      const a = link as HTMLAnchorElement;
      return {
        url: a.href,
        title: a.textContent.trim(),
        contestTitle: contestTitle,
      };
    });

    return Promise.resolve(stubs);
  }

  protected async parseTask(problem: ProblemStub): Promise<Task> {
    const body = await request(problem.url);
    const elem = htmlToElement(body);
    const task = new TaskBuilder('CSGOJ').setUrl(problem.url);

    task.setName(problem.title);
    task.setCategory(problem.contestTitle);

    const infoList = elem.querySelectorAll('.inline_span');
    task.setTimeLimit(Number(infoList[1].textContent.replace(' Sec', '')) * 1000);
    task.setMemoryLimit(Number(infoList[3].textContent.replace(' MB', '')));

    const inputs = [...elem.querySelectorAll('.sample_input_area')][0].textContent
      .split('##CASE##')
      .map(s => s.trim())
      .filter(Boolean);
    const outputs = [...elem.querySelectorAll('.sample_output_area')][0].textContent
      .split('##CASE##')
      .map(s => s.trim())
      .filter(Boolean);

    for (let i = 0; i < inputs.length || i < outputs.length; i++) {
      task.addTest(inputs[i] || '', outputs[i] || '');
    }

    return task.build();
  }
}
