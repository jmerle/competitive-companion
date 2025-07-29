import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class OlympicodeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://olympicode.rs/problem/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/(?:www\.)?olympicode\.rs\/problem\/\d+$/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Olympicode').setUrl(url);

    task.setName(elem.querySelector('.problem-statement-container h2').textContent);

    const limitsStr = elem.querySelector('.problem-statement-container .text-muted').textContent;

    const [time, timeM] = /\b(\d+)(m?s)\b/.exec(limitsStr).slice(1);
    task.setTimeLimit((timeM[0] === 'm' ? 1 : 1000) * parseFloat(time));

    const [mem, memM] = /\b(\d+)([MK]B)\b/.exec(limitsStr).slice(1);
    task.setMemoryLimit((memM[0] === 'M' ? 1 : 1 / 1024) * parseFloat(mem));

    const elems = elem.querySelector('markdown').children;
    for (let i = 0; i < elems.length; i++) {
      if (/^h[1-6]$/i.test(elems[i].nodeName) && /(?:S|Ex)ample|(?:In|Out)put/i.test(elems[i].textContent)) {
        // (Ex/S)ample header found
        if (elems[i + 1]?.nodeName !== 'PRE') {
          continue;
        }

        const input = elems[++i].textContent;

        do {
          i++;
        } while (i < elems.length && elems[i].nodeName !== 'PRE');

        task.addTest(input, elems[i].textContent);
      }
    }

    task.setInteractive(task.tests.length === 0);
    return task.build();
  }
}
