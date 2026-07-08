import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';

interface ProblemDescription {
  contestId: string;
  problemSymbol: string;
}

export class KEPUZContestParser extends ContestParser<ProblemDescription> {
  public getMatchPatterns(): string[] {
    return ['https://kep.uz/contests/*/problems'];
  }

  protected async getTasksToParse(html: string, url: string): Promise<ProblemDescription[]> {
    const elem = htmlToElement(html);

    const urlParts = url.split('/');
    const contestId = urlParts[urlParts.length - 2];

    const linkElems = [
      ...elem.querySelectorAll<HTMLAnchorElement>('a[href^="/contests/"][href*="/problem/"]'),
    ];
    return linkElems.map(linkElem => ({
      contestId,
      problemSymbol: linkElem.href.split('/').pop(),
    }));
  }

  protected async parseTask(problem: ProblemDescription): Promise<Task> {
    const url = `https://kep.uz/contests/${problem.contestId}/problem/${problem.problemSymbol}`;
    const task = new TaskBuilder('KEP.uz').setUrl(url);

    const body = await request(
      `https://kep.uz/api/contests/${problem.contestId}/problem?symbol=${problem.problemSymbol}`,
    );
    const data = JSON.parse(body).problem;

    task.setName(`${problem.problemSymbol}. ${data.title}`);

    task.setTimeLimit(data.timeLimit);
    task.setMemoryLimit(data.memoryLimit);

    for (const sampleTest of data.sampleTests) {
      task.addTest(sampleTest.input, sampleTest.output);
    }

    return task.build();
  }
}
