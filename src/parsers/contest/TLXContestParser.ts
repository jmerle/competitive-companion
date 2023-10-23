import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { ContestParser } from '../ContestParser';
import { TLXProblemParser } from '../problem/TLXProblemParser';

type ProblemDescription = { url: string; contestName: string; contestJid: string; type: 'contests' | 'problems' };

export class TLXContestParser extends ContestParser<ProblemDescription> {
  protected linkSelector =
    'div.contest-problem-card.content-card a.content-card-link, div.problemset-problem-card.content-card a.content-card-link';
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
        await this.fetch(`https://api.tlx.toki.id/v2/contest-web/slug/${contestSlug}/with-config`),
      ).contest;
    } else if (type == 'problems') {
      contest = JSON.parse(await this.fetch(`https://api.tlx.toki.id/v2/problemsets/slug/${contestSlug}`));
    } else {
      throw new Error(`Unknown contest type: ${type}`);
    }
    return [...elem.querySelectorAll(this.linkSelector)].map(el => ({
      url: (el as any).href,
      type,
      contestName: contest.name,
      contestJid: contest.jid,
    }));
  }

  protected async parseTask(problem: ProblemDescription): Promise<Task> {
    let fetchUrl: string;
    if (problem.type == 'contests') {
      fetchUrl = `https://api.tlx.toki.id/v2/contests/${problem.contestJid}/problems/${
        problem.url.split('/')[6]
      }/programming/worksheet`;
    } else {
      fetchUrl = `https://api.tlx.toki.id/v2/problemsets/${problem.contestJid}/problems/${
        problem.url.split('/')[5]
      }/worksheet`;
    }
    const worksheet = JSON.parse(await this.fetch(fetchUrl)).worksheet;

    const task = new TaskBuilder('TLX').setUrl(problem.url).setCategory(problem.contestName);
    task.setName(worksheet.statement.title);
    task.setTimeLimit(worksheet.limits.timeLimit);
    task.setMemoryLimit(worksheet.limits.memoryLimit / 1024);
    this.problemParser.parseTests(task, htmlToElement(worksheet.statement.text));
    return task.build();
  }
}
