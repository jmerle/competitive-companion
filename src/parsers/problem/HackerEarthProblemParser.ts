import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HackerEarthProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://www.hackerearth.com/*/algorithm/*',
      'https://www.hackerearth.com/*/approximate/*',
      'https://www.hackerearth.com/*/codemonk/',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HackerEarth').setUrl(url);

    await task.setName('Task');
    for (const selector of ['.title-panel > .title, #problem-title', '.problem-statement > div > div.large']) {
      const titleElem = elem.querySelector(selector);
      if (titleElem !== null) {
        await task.setName(titleElem.textContent.trim());
        break;
      }
    }

    const groupSuffix: string[] =
      elem.querySelector('.timings') !== null
        ? [elem.querySelector('.cover .title').textContent.trim()]
        : [...elem.querySelectorAll('.breadcrumb a')].map(el => el.textContent).slice(1);

    const category = groupSuffix
      .map(part => part.trim())
      .filter(part => part !== '')
      .join(' - ');

    if (category.length > 0) {
      task.setCategory(category);
    } else if (url.includes('/codemonk/')) {
      task.setCategory('Codemonk');
    }

    elem.querySelectorAll('.input-output-container').forEach(container => {
      const blocks = container.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });

    const limitsStr = elem.querySelector('.problem-solution-limits, .problem-guidelines').textContent;
    const limitsNums = limitsStr.match(/([0-9.,]+)/g).filter(item => /\d/.test(item));
    task.setTimeLimit(parseFloat(limitsNums[0]) * 1000);
    task.setMemoryLimit(parseInt(limitsNums[1], 10));

    return task.build();
  }
}
