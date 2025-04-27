import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CSGOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://cpc.csgrandeur.cn/csgoj/problemset/problem*', 'https://acm.sztu.edu.cn/csgoj/problemset/problem*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CSGOJ').setUrl(url);

    task.setName(elem.querySelector('h1').textContent.replace(/\s+/g, ' ').trim());

    const category = elem.querySelector('[name="Source"] a')?.textContent?.trim();
    if (category) {
      task.setCategory(category);
    }

    const infoList = elem.querySelectorAll('.inline_span');

    task.setTimeLimit(Number(infoList[1].textContent.replace(' Sec', '')) * 1000);
    task.setMemoryLimit(Number(infoList[3].textContent.replace(' MB', '')));

    const inputs = [...elem.querySelectorAll('.sample_input_area')];
    const outputs = [...elem.querySelectorAll('.sample_output_area')];

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i].textContent, outputs[i].textContent);
    }

    return task.build();
  }
}
