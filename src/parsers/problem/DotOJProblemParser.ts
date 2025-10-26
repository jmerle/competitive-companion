import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

export class DotOJProblemParser extends Parser {
  public static DOMAINS = [
    'dsaoj.sakiyary.cn',
    'exam.isedsa.cyou',
    'exam.cpl.icu',
    'exam2.cpl.icu',
    'game.si-qi.wang',
    'iseoj.nju.edu.cn',
    'iseoj.nju.edu.cn/is',
    'old.oj.cpl.icu',
    'oj.cpl.icu',
    'oj.si-qi.wang',
    'public.game.si-qi.wang',
    'public.oj.cpl.icu',
  ];

  public getMatchPatterns(): string[] {
    return DotOJProblemParser.DOMAINS.map(domain => `https://${domain}/contest/*/problem/*`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async parse(url: string, html: string): Promise<Sendable> {
    const auth = JSON.parse(localStorage.getItem('dotoj-auth') || 'null');
    if (!auth) {
      throw new Error('Please login to DotOJ first.');
    }

    const baseUrl = url.replace(/\/contest\/\d+\/problem\/\d+$/, '');
    const [, problemId] = /\/contest\/(\d+)\/problem\/(\d+)$/.exec(url).slice(1);

    const task = new TaskBuilder('DotOJ');
    task.setUrl(url);

    const apiUrl = `${baseUrl}/api/v2/problem/${problemId}`;

    const problemData = await request(apiUrl, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    const data = JSON.parse(problemData);
    task.setName(data.title);
    task.setTimeLimit(data.timeLimit);
    task.setMemoryLimit(data.memoryLimit / 1000);
    task.setInteractive(data.isInteractive);

    if (!data.isInteractive) {
      for (const test of data.sampleCases) {
        task.addTest(window.atob(test.input), window.atob(test.output));
      }
    }

    return task.build();
  }
}
