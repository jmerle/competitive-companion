import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class FacebookHackerCupProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.facebook.com/hackercup/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Facebook Hacker Cup').setUrl(url);

    task.setName(elem.querySelector('#content .clearfix > .lfloat').textContent);
    task.setCategory(elem.querySelector('h2.uiHeaderTitle').textContent);

    const blocks = elem.querySelectorAll('.uiBoxGray > pre');
    const input = blocks[0].textContent;
    const output = blocks[1].textContent;
    task.addTest(input, output);

    const filename = task.name.toLowerCase().replace(/ /g, '_');

    task.setInput({
      fileName: filename + '.txt',
      type: 'file',
    });

    task.setOutput({
      fileName: filename + '.out',
      type: 'file',
    });

    task.setTestType(TestType.MultiNumber);

    task.setTimeLimit(360000);
    task.setMemoryLimit(1024);

    return task.build();
  }
}
