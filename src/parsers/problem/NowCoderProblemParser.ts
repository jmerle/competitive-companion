import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NowCoderProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://ac.nowcoder.com/acm/problem/*',
      'https://ac.nowcoder.com/acm/contest/*/*',
      'https://www.nowcoder.com/practice/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('NowCoder').setUrl(url);

    if (url.includes('/acm/')) {
      this.parseACM(elem, task);
    } else {
      this.parsePractice(elem, task);
    }

    return task.build();
  }

  private parseACM(elem: Element, task: TaskBuilder): void {
    task.setName(elem.querySelector('.terminal-topic-title').textContent.trim());

    const timeLimitStr = elem.querySelector('.question-intr > .subject-item-wrap > span').textContent.split('，').pop();
    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10) * 1000);

    const memoryLimitStr = elem
      .querySelector('.question-intr > .subject-item-wrap > span:nth-of-type(2)')
      .textContent.split('，')
      .pop();
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    elem.querySelectorAll('.question-oi-bd').forEach(tests => {
      const blocks = tests.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });
  }

  private parsePractice(elem: Element, task: TaskBuilder): void {
    task.setName(elem.querySelector('.hide-txt')?.textContent.trim() || '');

    const getLimits = (spans: NodeListOf<Element>, timeIndex: number, memoryIndex: number): void => {
      const timeLimitStr = spans[timeIndex]?.textContent.trim();
      const timeLimit = timeLimitStr ? parseInt(/时间限制：(\d+)/.exec(timeLimitStr)?.[1] || '1') : 0;
      const memoryLimitStr = spans[memoryIndex]?.textContent.trim();
      const memoryLimit = memoryLimitStr ? parseInt(/空间限制：(\d+)/.exec(memoryLimitStr)?.[1] || '256') : 0;

      task.setTimeLimit(timeLimit);
      task.setMemoryLimit(memoryLimit);
    };

    const spans = elem.querySelectorAll('.flex-auto.fs-xs span');

    if (spans.length === 7) {
      getLimits(spans, 3, 5);
    } else if (spans.length === 4) {
      getLimits(spans, 0, 2);
    }

    const blocks = [...elem.querySelectorAll('.section-box')];
    blocks.forEach(block => {
      const preTags = block.querySelectorAll('pre');
      if (preTags.length >= 2) {
        const inputData = preTags[0].textContent.trim();
        const outputData = preTags[1].textContent.trim();
        task.addTest(inputData, outputData);
      }
    });
  }
}
