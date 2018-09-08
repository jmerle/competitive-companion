import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class FacebookHackerCupProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.facebook.com/hackercup/problem/*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(
        elem.querySelector('#content .clearfix > .lfloat').textContent,
      );

      task.setGroup(elem.querySelector('h2.uiHeaderTitle').textContent);

      const blocks = elem.querySelectorAll('.uiBoxGray > pre');
      const input = blocks[0].textContent;
      const output = blocks[1].textContent;
      task.addTest(input, output);

      let inputPattern = '';
      for (const char of task.name) {
        if (/[a-z]/i.test(char)) {
          inputPattern += char.toLowerCase();
        } else {
          inputPattern += '.*';
        }
      }

      task.setInput({
        pattern: inputPattern + '.*[.]txt',
        type: 'regex',
      });

      task.setOutput({
        fileName: task.name.toLowerCase().replace(/ /g, '') + '.out',
        type: 'file',
      });

      task.setTestType(TestType.MultiNumber);

      task.setTimeLimit(360000);
      task.setMemoryLimit(1024);

      resolve(task.build());
    });
  }
}
