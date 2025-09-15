import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { DotOJProblemParser } from '../problem/DotOJProblemParser';

export class DotOJContestParser extends ContestParser<[string, string, string]> {
  public getMatchPatterns(): string[] {
    return DotOJProblemParser.DOMAINS.map(domain => `https://${domain}/contest/*`);
  }

  protected async getTasksToParse(_: string, url: string): Promise<[string, string, string][]> {
    void _;
    const auth = JSON.parse(localStorage.getItem('dotoj-auth') || 'null');
    if (!auth) {
      throw new Error('Please login to DotOJ first.');
    }

    const contestId = /\/contest\/(\d+)$/.exec(url)[1];
    const baseUrl = url.replace(/\/contest\/\d+$/, '');

    const contest = await request(`${baseUrl}/api/v2/contest/${contestId}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const problemsData = JSON.parse(contest).problems;

    return problemsData.map((problem: any) => [
      `${baseUrl}/api/v2/problem/${problem.id}`,
      `${baseUrl}/contest/${contestId}/problem/${problem.id}`,
      problem.title,
    ]);
  }
  protected async parseTask(input: [string, string, string]): Promise<Task> {
    console.log(input);

    const auth = JSON.parse(localStorage.getItem('dotoj-auth') || 'null');
    if (!auth) {
      throw new Error('Please login to DotOJ first.');
    }

    const [apiUrl, url, title] = input;
    const problemData = await request(apiUrl, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const task = new TaskBuilder('DotOJ');
    task.setUrl(url);
    task.setName(title);

    const data = JSON.parse(problemData);

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
