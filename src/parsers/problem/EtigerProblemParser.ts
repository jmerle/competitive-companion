import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EtigerProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.etiger.vip/question_info'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Etiger').setUrl(url);

    // if (elem.querySelector('.main-container') !== null) {
    this.parseFromPage(task, elem);
    // } else {
    //   this.parseFromScript(task, elem);
    // }

    return task.build();
  }

  private parseFromPage(task: TaskBuilder, elem: Element): void {
    task.setName(elem.querySelector('.question-list-title > span').textContent.trim());

    // const timeLimitStr = elem.querySelector('.stat > .field:nth-child(3) > .value').textContent;
    const timeLimitStr = "1.00s";
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    // const memoryLimitStr = elem.querySelector('.stat > .field:nth-child(4) > .value').textContent;
    const memoryLimitStr = "512.00MB"
    task.setMemoryLimit(parseInt(memoryLimitStr));

    elem.querySelectorAll('.question-detail-output-sample-con').forEach(sample => {
      const input = sample.querySelector('.question-detail-output-sample-con-1 > pre').textContent;
      const output = sample.querySelector('.question-detail-output-sample-con-2 > pre').textContent;

      task.addTest(input, output);
    });
  }

  // private parseFromScript(task: TaskBuilder, elem: Element): void {
  //   for (const scriptElem of elem.querySelectorAll('script')) {
  //     const script = scriptElem.textContent;
  //     if (script.startsWith('window._feInjection')) {
  //       const startQuoteIndex = script.indexOf('"');
  //       const endQuoteIndex = script.substr(startQuoteIndex + 1).indexOf('"');
  //       const encodedData = script.substr(startQuoteIndex + 1, endQuoteIndex);

  //       const data = JSON.parse(decodeURIComponent(encodedData)).currentData.problem;

  //       task.setName(`${data.pid} ${data.title}`.trim());

  //       task.setTimeLimit(Math.max(...data.limits.time));
  //       task.setMemoryLimit(Math.max(...data.limits.memory) / 1024);

  //       for (const sample of data.samples) {
  //         task.addTest(sample[0], sample[1]);
  //       }

  //       return;
  //     }
  //   }

  //   throw new Error('Failed to find problem data');
  // }
}
