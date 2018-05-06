import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Test } from '../../models/Test';
import { TestType } from '../../models/TestType';

export class FacebookHackerCupProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.facebook.com/hackercup/problem/*'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('#content .clearfix > .lfloat').textContent);
      task.setGroup(elem.querySelector('h2.uiHeaderTitle').textContent);

      const blocks = elem.querySelectorAll('.uiBoxGray > pre');
      const input = blocks[0].textContent;
      const output = blocks[1].textContent;
      task.addTest(new Test(input, output));

      let inputPattern = '';
      for (let i = 0; i < task.name.length; i++) {
        if (/[a-z]/i.test(task.name[i])) {
          inputPattern += task.name[i].toLowerCase();
        } else {
          inputPattern += '.*';
        }
      }

      task.setInput({
        type: 'regex',
        pattern: inputPattern + '.*[.]txt',
      });

      task.setOutput({
        type: 'file',
        fileName: task.name.toLowerCase().replace(/ /g, '') + '.out',
      });

      task.setTestType(TestType.MultiNumber);

      task.setTimeLimit(360000);
      task.setMemoryLimit(1024);

      resolve(task.build());
    });
  }
}
