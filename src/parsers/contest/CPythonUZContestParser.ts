import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';

export class CPythonUZContestParser extends ContestParser<[string, string, string]> {
  public getMatchPatterns(): string[] {
    return ['https://cpython.uz/competitions/contests/contest/*'];
  }

  protected async getTasksToParse(html: string, url: string): Promise<[string, string, string][]> {
    const problemId = /\/contest\/(\d+)\//.exec(url)[1];

    const dataResponse = await request(`https://cpython.uz/api/contests/${problemId}`);
    const data = JSON.parse(dataResponse);

    const problemsResponse = await request(`https://cpython.uz/api/contests/${problemId}/problems`);
    const problems: any[] = JSON.parse(problemsResponse);

    return problems.map(problem => [data.title, problemId, problem.symbol]);
  }

  protected async parseTask(input: [string, string, string]): Promise<Task> {
    const [title, problemId, symbol] = input;

    const dataResponse = await request(`https://cpython.uz/api/contests/${problemId}/problem?symbol=${symbol}`);
    const data = JSON.parse(dataResponse);

    const task = new TaskBuilder('CPython.uz');
    task.setUrl(`https://cpython.uz/competitions/contests/contest/${problemId}/problem/${symbol}`);
    task.setCategory(title);

    await task.setName(`${symbol}. ${data.problem.title}`);

    task.setTimeLimit(data.problem.timeLimit);
    task.setMemoryLimit(data.problem.memoryLimit);

    for (const test of data.problem.sampleTests) {
      task.addTest(test.input, test.output);
    }

    return task.build();
  }
}
