import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { VirtualJudgeProblemParser } from '../problem/VirtualJudgeProblemParser';

export class VirtualJudgeContestParser extends ContestParser<[string, string, any]> {
  private problemParser = new VirtualJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://vjudge.net/contest/*', 'https://vjudge.net.cn/contest/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector('#contest-problems tr > .prob-title > a') !== null;
  }

  protected async getTasksToParse(html: string, url: string): Promise<[string, string, any][]> {
    const elem = htmlToElement(html);
    const category = elem.querySelector('#time-info > .row > .col-xs-6 > h3').textContent.trim();

    const data = JSON.parse(elem.querySelector<HTMLTextAreaElement>('textarea[name="dataJson"]').value);
    return data.problems.map((problem: any) => [url, category, problem]);
  }

  protected async parseTask([url, category, data]: [string, string, any]): Promise<Task> {
    const task = new TaskBuilder('Virtual Judge').setUrl(`${url.split('#')[0]}#problem/${data.num}`);

    await task.setName(`${data.num} - ${data.title}`);
    task.setCategory(category);

    for (const property of data.properties) {
      if (property.title == 'Time limit') {
        task.setTimeLimit(parseFloat(property.content.split(' ')[0]));
      } else if (property.title == 'Memory limit' || property.title == 'Mem limit') {
        task.setMemoryLimit(parseFloat(property.content.split(' ')[0]) / 1024);
      }
    }

    const latestVersion = data.descBriefs[data.descBriefs.length - 1];
    const descriptionUrl = `https://vjudge.net/problem/description/${latestVersion.key}?${latestVersion.version}`;
    const description = await request(descriptionUrl, { credentials: 'same-origin' });
    const jsonContainer = htmlToElement(description).querySelector('.data-json-container');
    const json = JSON.parse(jsonContainer.textContent);

    const codeBlocks = this.problemParser.getCodeBlocksFromDescription(json);
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      task.addTest(codeBlocks[i], codeBlocks[i + 1]);
    }

    return task.build();
  }
}
