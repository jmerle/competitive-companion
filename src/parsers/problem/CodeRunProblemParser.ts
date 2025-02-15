import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeRunProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://coderun.yandex.ru/problem/*', 'https://coderun.yandex.ru/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CodeRun').setUrl(url);

    task.setName(elem.querySelector('h1').textContent);

    const limitsElems = elem.querySelectorAll('dl[class^="Description_description-runtime-limits"] > dd > p');
    task.setTimeLimit(parseInt(limitsElems[0].textContent.split(' ')[0]) * 1000);
    task.setMemoryLimit(parseInt(limitsElems[1].textContent.split(' ')[0]));

    elem.querySelectorAll('.io-sample').forEach(sampleElem => {
      const input = sampleElem.querySelector('.input-snippet code').textContent;
      const output = sampleElem.querySelector('.output-snippet code').textContent;

      task.addTest(input, output);
    });

    return task.build();
  }
}
