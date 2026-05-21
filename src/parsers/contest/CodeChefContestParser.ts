import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement, markdownToHtml } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { CodeChefOldProblemParser } from '../problem/CodeChefOldProblemParser';

interface TaskInput {
  apiUrl: string;
  contestName: string;
}

export class CodeChefContestParser extends ContestParser<TaskInput> {
  public getMatchPatterns(): string[] {
    return ['https://www.codechef.com/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector('.cc-problem-name a') !== null;
  }

  protected async getTasksToParse(html: string, url: string): Promise<TaskInput[]> {
    const elem = htmlToElement(html);
    const contestCode = new URL(url).pathname.split('/').pop();

    let contestName = contestCode;
    try {
      const data = JSON.parse(await request(`https://www.codechef.com/api/contests/${contestCode}`));
      if (data.status === 'success' && typeof data.name === 'string' && data.name.length > 0) {
        contestName = data.name;
      }
    } catch {
      // keep contestCode as fallback
    }

    return [...elem.querySelectorAll<HTMLLinkElement>('.cc-problem-name a')].map(el => {
      const problemId = el.href.split('/').pop();
      return {
        apiUrl: `https://www.codechef.com/api/contests/${contestCode}/problems/${problemId}`,
        contestName,
      };
    });
  }

  protected async parseTask(input: TaskInput): Promise<Task> {
    const body = await request(input.apiUrl);
    const model = JSON.parse(body);

    const taskUrl = input.apiUrl.replace('www.codechef.com/api/contests/', 'www.codechef.com/');
    const task = new TaskBuilder('CodeChef').setUrl(taskUrl);

    task.setName(model.problem_name);
    task.setCategory(input.contestName);

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
