import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { ContestParser } from '../ContestParser';

export class UniversalCupContestParser extends ContestParser<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTasksToParse(html: string, url: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTask(input: string): Promise<Task> {
    throw new Error('Method not implemented.');
  }

  public getMatchPatterns(): string[] {
    return ['https://contest.ucup.ac/contest/*'];
  }

  public canHandlePage(): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async parse(url: string, html: string): Promise<Sendable> {
    /// The statements and test cases for each problem are given as a PDF file,
    /// and we don't provide a parser for that.

    const elem = htmlToElement(html);

    const contestName = elem
      .querySelector('.uoj-content')
      .querySelector('h1')
      .textContent.replace('\n', ' ')
      .replace('\t', ' ')
      .trim();

    const allRows = elem.querySelector('table').querySelectorAll('tr');
    const rows = [...allRows].slice(1);

    const tasks = rows.map(row => {
      const task = new TaskBuilder('Universal Cup').setCategory(contestName);

      const letter = row.querySelector('td').textContent.replace('\n', ' ').replace('\t', ' ').trim();
      const taskUrl = row.querySelector('a').href;
      const taskName = row.querySelector('a').textContent.replace('\n', ' ').replace('\t', ' ').trim();

      task.setUrl(taskUrl);
      task.setName(`${letter}. ${taskName}`);

      return task.build();
    });

    return new Contest(tasks);
  }
}
