import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NZOIProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://train.nzoi.org.nz/problems/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/train\.nzoi\.org\.nz\/problems\/\d+\/?(?:[?#].*)?$/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('NZOI').setUrl(url);

    task.setName(elem.querySelector('#main-page-title-box > h1').textContent.trim());

    // The limits and I/O configuration are rendered as "<b>Label: </b>value<br />" pairs
    for (const label of elem.querySelectorAll('#main-container > b')) {
      const key = label.textContent.trim();
      const value = label.nextSibling?.textContent.trim() ?? '';

      if (key === 'Input File:') {
        task.setInput({ type: 'file', fileName: value });
      } else if (key === 'Output File:') {
        task.setOutput({ type: 'file', fileName: value });
      } else if (key === 'Memory limit:') {
        task.setMemoryLimit(parseFloat(value));
      } else if (key === 'Time limit:') {
        task.setTimeLimit(parseFloat(value) * 1000);
      }
    }

    for (const sample of elem.querySelectorAll('ul.samples > li')) {
      const input = sample.querySelector('.input pre');
      const output = sample.querySelector('.output pre');

      if (input !== null && output !== null) {
        task.addTest(input.textContent, output.textContent);
      }
    }

    // Some older problems have their samples written in the statement itself instead
    if (task.tests.length === 0) {
      const findBlocks = (regex: RegExp): Element[] =>
        [...elem.querySelectorAll('.statement h2, .statement h3')]
          .filter(heading => regex.test(heading.textContent.trim()))
          .map(heading => heading.nextElementSibling)
          .filter(block => block !== null && block.tagName === 'PRE');

      const inputs = findBlocks(/^sample input/i);
      const outputs = findBlocks(/^sample output/i);

      for (let i = 0; i < inputs.length && i < outputs.length; i++) {
        task.addTest(inputs[i].textContent, outputs[i].textContent);
      }
    }

    return task.build();
  }
}
