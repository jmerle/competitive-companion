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
    const timenmem = elem.querySelector('.problem-statement-container .text-muted').textContent;
    const [time, timeM] = /\b(\d+)(m?s)\b/.exec(timenmem).slice(1);
    task.setTimeLimit((timeM[0] === 'm' ? 1 : 1000) * parseFloat(time));
    const [mem, memM] = /\b(\d+)([MK]B)\b/.exec(timenmem).slice(1);
    task.setMemoryLimit((memM[0] === 'M' ? 1 : 1 / 1024) * parseFloat(mem));

    const tests: [string, string][] = [];
    const elms = elem.querySelector('markdown').children;
    for (let i = 0; i < elms.length; i++) {
      if (/^h[1-6]$/i.test(elms[i].nodeName) && /(?:S|Ex)ample|(?:In|Out)put/i.test(elms[i].textContent)) {
        // (Ex/S)ample header found
        if (elms[i + 1]?.nodeName !== 'PRE') continue;
        const input = elms[++i].textContent;
        do i++;
        while (i < elms.length && elms[i].nodeName !== 'PRE');
        tests.push([input, elms[i].textContent]);
      }
    }
    if (tests.length) for (const [I, O] of tests) task.addTest(I, O);
    else task.setInteractive(true);

    return task.build();
  }
}
