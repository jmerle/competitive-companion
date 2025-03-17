import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';

export class EolympBasecampContestParser extends ContestParser<[string, string]> {
  private linkSelector = '.MuiPaper-elevation > .MuiList-root > a.MuiButtonBase-root';

  public getMatchPatterns(): string[] {
    return ['https://basecamp.eolymp.com/*/compete/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector(this.linkSelector) !== null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getTasksToParse(html: string, url: string): Promise<[string, string][]> {
    const elem = htmlToElement(html);
    const title = elem.querySelector('.MuiTypography-h1').textContent;

    return [...elem.querySelectorAll(this.linkSelector)].map(el => [title, (el as any).href]);
  }

  protected async parseTask([title, url]: [string, string]): Promise<Task> {
    const html = await request(url);

    const elem = htmlToElement(html);
    const task = new TaskBuilder('Eolymp').setUrl(url);

    task.setCategory(`Basecamp - ${title}`);

    const dataScript = [...elem.querySelectorAll('script')].find(el =>
      el.textContent.includes('JudgeProblem'),
    ).textContent;

    const arrayStart = dataScript.indexOf('[');
    const arrayEnd = dataScript.lastIndexOf(']');
    const array = JSON.parse(dataScript.substring(arrayStart, arrayEnd + 1));

    const dataStart = array[1].indexOf('[');
    const dataEnd = array[1].lastIndexOf(']');
    const data = JSON.parse(array[1].substring(dataStart, dataEnd + 1))[3].value;

    for (const row of data.statement.contentTree.children) {
      switch (row.type) {
        case 'heading':
          await task.setName(row.children[0].attr.text);
          break;
        case 'problem-constraints':
          task.setTimeLimit(parseInt(row.attr['time-limit-max']));
          task.setMemoryLimit(Math.floor(parseInt(row.attr['memory-limit-max']) / 1024 / 1024));
          break;
        case 'problem-examples':
          for (const child of row.children) {
            const input = await request(child.attr['input-ref'], { credentials: 'same-origin' });
            const output = await request(child.attr['output-ref'], { credentials: 'same-origin' });
            task.addTest(input, output);
          }
          break;
      }
    }

    return task.build();
  }
}
