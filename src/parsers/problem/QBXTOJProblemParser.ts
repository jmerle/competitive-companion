import type { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class QBXTOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://noip.ac/rs/show_problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const doc = htmlToElement(html);
    const task = new TaskBuilder('QBXTOJ').setUrl(url);

    await task.setName(doc.querySelector('h1.ui.header').textContent);

    const [, , timeMs, memMB] = [...doc.querySelector('table > tbody > tr').children].map(
      td => td.childNodes[0].textContent,
    );

    task.setTimeLimit(parseFloat(timeMs.trim()));
    task.setMemoryLimit(parseInt(memMB.trim(), 10));

    const codeBlocks = [...doc.querySelectorAll('.ui.segment > pre')];

    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
