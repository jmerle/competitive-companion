import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class MarisaOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://marisaoj.com/problem/*',
      'https://marisaoj.com/mashup/*/problem/*',
      'https://*.marisaoj.com/problem/*',
      'https://*.marisaoj.com/mashup/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('MarisaOJ').setUrl(url);

    task.setName(elem.querySelector('.header > h2').textContent.trim());
    task.setCategory(elem.querySelector('#module-info > .problem-table > caption').textContent.trim());

    const [timeLimitElem, memoryLimitElem] = [...elem.querySelectorAll('.header > div')];

    task.setTimeLimit(parseInt(timeLimitElem.textContent.match(/\d+/)[0], 10));
    task.setMemoryLimit(parseInt(memoryLimitElem.textContent.match(/\d+/)[0], 10));

    const testBlocks = [...elem.querySelectorAll('.math-content :is(#example, #sample-test) ~ .code-wrapper pre')];

    for (let i = 0; i < testBlocks.length; i += 2) {
      task.addTest(testBlocks[i].textContent, testBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
