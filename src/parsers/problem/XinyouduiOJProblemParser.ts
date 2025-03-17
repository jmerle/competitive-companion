import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class XinyouduiOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://www.xinyoudui.com/ac/contest/*/problem/*',
      'https://xinyoudui.com/ac/contest/*/problem/*',
      'https://contest.xinyoudui.com/contest/*/problem/*',
      'https://learn.x-camp.org/ac/contest/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('XinyouduiOJ').setUrl(url);

    const type = url.includes('ac');
    const urls = url.split('/');
    const filein = elem
      .querySelectorAll(
        type
          ? '#problem-statement > div.ac-ant-space.css-186k2qh.ac-ant-space-vertical.ac-ant-space-gap-row-small.ac-ant-space-gap-col-small._overview_dpnwc_42 > div:nth-child(2) > div > blockquote > div:nth-child(2) > div:nth-child(1) > div > span'
          : '#rc-tabs-0-panel-statement > div > div.contest-ant-space.css-186k2qh.contest-ant-space-vertical.contest-ant-space-gap-row-small.contest-ant-space-gap-col-small._overview_n5cq7_9 > div:nth-child(2) > div > div:nth-child(1) > div > blockquote > div:nth-child(2) > div:nth-child(1) > div > span',
      )
      .item(0)?.textContent;
    const pid = filein == undefined ? 'XYD ' + urls[urls.length - 1] : filein.split('.').at(0);

    await task.setName(pid);

    const blocks = elem.querySelectorAll('pre ' + (type ? '.ac-ant-typography' : '.contest-ant-typography'));

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
