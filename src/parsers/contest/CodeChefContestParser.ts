import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement, markdownToHtml } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { CodeChefOldProblemParser } from '../problem/CodeChefOldProblemParser';

export class CodeChefContestParser extends ContestParser<string> {
  public getMatchPatterns(): string[] {
    return ['https://www.codechef.com/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector('.cc-problem-name a') !== null;
  }

  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const elem = htmlToElement(html);
    const contestId = new URL(url).pathname.split('/').pop();

    return [...elem.querySelectorAll<HTMLLinkElement>('.cc-problem-name a')].map(el => {
      const problemId = el.href.split('/').pop();
      return `https://www.codechef.com/api/contests/${contestId}/problems/${problemId}`;
    });
  }

  protected async parseTask(apiUrl: string): Promise<Task> {
    const body = await request(apiUrl);
    const model = JSON.parse(body);

    const taskUrl = apiUrl.replace('www.codechef.com/api/contests/', 'www.codechef.com/');
    const task = new TaskBuilder('CodeChef').setUrl(taskUrl);

    await task.setName(model.problem_name);
    task.setCategory(model.contest_code);

    task.setInteractive(model.body.includes('This is an interactive problem'));

    for (const testCase of model.problemComponents.sampleTestCases) {
      if (!testCase.isDeleted) {
        task.addTest(testCase.input, testCase.output);
      }
    }

    if (task.tests.length === 0) {
      const body = markdownToHtml(model.body.replace(/(\r\n)/g, '\n'));
      new CodeChefOldProblemParser().parseTests(body, task);
    }

    task.setTimeLimit(parseFloat(model.max_timelimit) * 1000);
    task.setMemoryLimit(256);

    return task.build();
  }
}
