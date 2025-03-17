import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { requestInBackground } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { TLXProblemParser } from '../problem/TLXProblemParser';

type ProblemDescription = { url: string; contestName: string; contestJid: string; type: 'contests' | 'problems' };

export class TLXContestParser extends ContestParser<ProblemDescription> {
  protected problemParser = new TLXProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://tlx.toki.id/contests/*/problems', 'https://tlx.toki.id/problems/*'];
  }

  protected async getTasksToParse(html: string, url: string): Promise<ProblemDescription[]> {
    const elem = htmlToElement(html);

    const type = url.split('/')[3];
    const contestSlug = url.split('/')[4];

    let contest: { name: string; jid: string };
    if (type == 'contests') {
      contest = JSON.parse(
        await requestInBackground(`https://api.tlx.toki.id/v2/contest-web/slug/${contestSlug}/with-config`),
      ).contest;
    } else if (type == 'problems') {
      contest = JSON.parse(await requestInBackground(`https://api.tlx.toki.id/v2/problemsets/slug/${contestSlug}`));
    } else {
      throw new Error(`Unknown contest type: ${type}`);
    }

    return [...elem.querySelectorAll('a.content-card-link[href*="/problems/"]')].map(el => ({
      url: (el as any).href,
      type,
      contestName: contest.name,
      contestJid: contest.jid,
    }));
  }

  protected async parseTask(problem: ProblemDescription): Promise<Task> {
    const { url, contestName, contestJid } = problem;

    const task = new TaskBuilder('TLX').setUrl(url).setCategory(contestName);

    let fetchUrl: string;
    if (problem.type == 'contests') {
      const problemId = url.split('/')[6];
      fetchUrl = `https://api.tlx.toki.id/v2/contests/${contestJid}/problems/${problemId}/programming/worksheet`;
    } else {
      const problemId = url.split('/')[5];
      fetchUrl = `https://api.tlx.toki.id/v2/problemsets/${contestJid}/problems/${problemId}/worksheet`;
    }

    const worksheet = JSON.parse(await requestInBackground(fetchUrl)).worksheet;

    await task.setName(worksheet.statement.title);
    task.setTimeLimit(worksheet.limits.timeLimit);
    task.setMemoryLimit(worksheet.limits.memoryLimit / 1024);
    this.problemParser.parseTests(task, htmlToElement(worksheet.statement.text));

    return task.build();
  }
}
