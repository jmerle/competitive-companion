import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement, markdownToHtml } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';

export class LanqiaoContestParser extends ContestParser<[string, string, string, string]> {
  private taskSelector = '.ant-table-tbody > .ant-table-row';

  public getMatchPatterns(): string[] {
    return ['https://www.lanqiao.cn/oj-contest/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector(this.taskSelector) !== null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getTasksToParse(html: string, url: string): Promise<[string, string, string, string][]> {
    const elem = htmlToElement(html);

    const contestId = /contest_detail:{id:(\d+),/.exec(html)[1];
    const contestTitle = elem
      .querySelector('.contest-info-panel > .title')
      .textContent.trim()
      .split('\n')[0]
      .trim()
      .replace(/\s+/g, ' ');

    return [...elem.querySelectorAll(this.taskSelector)].map((el, i) => [
      contestId,
      contestTitle,
      el.getAttribute('data-row-key'),
      `${i + 1}. ${el.querySelector('.problem-name').textContent.trim()}`,
    ]);
  }

  protected async parseTask([contestId, contestTitle, problemId, problemName]: [
    string,
    string,
    string,
    string,
  ]): Promise<Task> {
    const url = `https://www.lanqiao.cn/problems/${problemId}/learning/?contest_id=${contestId}`;
    const html = await request(url);

    const task = new TaskBuilder('Lanqiao').setUrl(url);

    await task.setName(problemName);
    task.setCategory(contestTitle);

    // Parsing using regex is a bit wonky, but is probably the most readable way to parse the JS code containing the problem data
    const limits = /}\(([^,]+,)*?((\d+),)((\d+),)/.exec(html);
    const limitA = parseInt(limits[3]);
    const limitB = parseInt(limits[5]);

    task.setTimeLimit(Math.min(limitA, limitB) * 1000);
    task.setMemoryLimit(Math.max(limitA, limitB));

    const markdown = /question_stem:"([^"]+)"/.exec(html)[1].replace(/\\n/g, '\n');
    const content = htmlToElement(markdownToHtml(markdown));

    const blocks = content.querySelectorAll('pre > code');
    for (let i = blocks.length % 2 === 0 ? 0 : 1; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent.trim(), blocks[i + 1].textContent.trim());
    }

    return task.build();
  }
}
