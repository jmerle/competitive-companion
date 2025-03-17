import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class BloombergCodeConProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://codecon.bloomberg.com/*/*', 'https://codecon.bloomberg.com/contest/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Bloomberg CodeCon').setUrl(url);

    await task.setName(elem.querySelector('.problem-page-pane > h1').textContent.trim());
    task.setCategory(elem.querySelector('.sidebar-title').textContent.trim());

    const timeLimitStr = elem
      .querySelector('.problem-parameters > .fa-dashboard')
      .childNodes[0].textContent.split(' ')[2]
      .split('s')[0];
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem.querySelector('.fa-flash').childNodes[0].textContent.split(' ')[2].split('MB')[0];
    task.setMemoryLimit(parseInt(memoryLimitStr, 10));

    const inputs: string[] = [];
    const outputs: string[] = [];

    elem.querySelectorAll('.io-panel > .panel-item').forEach(item => {
      const text = item.childNodes[1].textContent;

      if (text === 'Input') {
        inputs.push(item.childNodes[3].textContent);
      } else if (text === 'Output') {
        outputs.push(item.childNodes[3].textContent);
      }
    });

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i], outputs[i]);
    }

    task.setJavaMainClass('Problem');
    return task.build();
  }
}
