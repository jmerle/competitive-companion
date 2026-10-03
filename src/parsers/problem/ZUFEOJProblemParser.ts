import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

interface ZufeOjProblem {
  problem_id: number | null;
  num: number | null;
  title: string;
  time_limit: number;
  memory_limit: number;
  samples: { input: string; output: string }[];
}

export class ZUFEOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acm.ocrosoft.com/problem.php*', 'https://acm.ocrosoft.com/problem.php*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/acm\.ocrosoft\.com\/problem\.php\?(?:id=\d+|cid=\d+&pid=\d+)(?:&.*)?$/];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async parse(url: string, html: string): Promise<Sendable> {
    const params = new URL(url).searchParams;
    const task = new TaskBuilder('ZUFEOJ').setUrl(url);

    let problem: ZufeOjProblem;
    if (params.has('cid')) {
      problem = await this.fetchProblem(
        `https://acm.ocrosoft.com/api/contests/${params.get('cid')}/problems/${params.get('pid')}`,
      );

      const index = problem.num ?? parseInt(params.get('pid'), 10);
      task.setName(`${this.getContestProblemLetter(index)}: ${problem.title.trim()}`);
    } else {
      problem = await this.fetchProblem(`https://acm.ocrosoft.com/api/problems/${params.get('id')}`);
      task.setName(`${problem.problem_id}: ${problem.title.trim()}`);
    }

    task.setTimeLimit(problem.time_limit * 1000);
    task.setMemoryLimit(problem.memory_limit);

    for (const sample of problem.samples) {
      task.addTest(sample.input, sample.output);
    }

    return task.build();
  }

  private async fetchProblem(apiUrl: string): Promise<ZufeOjProblem> {
    const response = JSON.parse(await request(apiUrl));

    if (response.code !== 0) {
      throw new Error(`The ZUFEOJ API returned an error (${response.error}): ${response.message}`);
    }

    return response.data;
  }

  // Contest problems get letter labels: A-Z, then AA-ZZ, then 27, 28, ...
  private getContestProblemLetter(index: number): string {
    if (index < 26) {
      return String.fromCharCode(65 + index);
    }

    if (index < 702) {
      const rest = index - 26;
      return String.fromCharCode(65 + Math.floor(rest / 26)) + String.fromCharCode(65 + (rest % 26));
    }

    return String(index);
  }
}
