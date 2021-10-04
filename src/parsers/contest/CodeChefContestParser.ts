import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement, markdownToHtml } from '../../utils/dom';
import { Parser } from '../Parser';
import { CodeChefProblemParser } from '../problem/CodeChefProblemParser';

export class CodeChefContestParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.codechef.com/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector('.cc-problem-name a') !== null;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    const links: string[] = [...elem.querySelectorAll('.cc-problem-name a')].map(el =>
      (el as any).href.replace('www.codechef.com/', 'www.codechef.com/api/contests/'),
    );

    const bodies = await this.fetchAll(links);
    const models = bodies.map(body => JSON.parse(body));
    const tasks: Task[] = [];

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const task = new TaskBuilder('CodeChef').setUrl(
        links[i].replace('www.codechef.com/api/contests/', 'www.codechef.com/'),
      );

      task.setName(model.problem_name);
      task.setCategory(model.contest_name);

      task.setInteractive(html.includes('This is an interactive problem'));

      for (const testCase of model.problemComponents.sampleTestCases) {
        if (!testCase.isDeleted) {
          task.addTest(testCase.input, testCase.output);
        }
      }

      if (task.tests.length === 0) {
        const body = markdownToHtml(model.body.replace(/(\r\n)/g, '\n'));
        new CodeChefProblemParser().parseTests(body, task);
      }

      task.setTimeLimit(parseFloat(model.max_timelimit) * 1000);
      task.setMemoryLimit(256);

      tasks.push(task.build());
    }

    return new Contest(tasks);
  }
}
