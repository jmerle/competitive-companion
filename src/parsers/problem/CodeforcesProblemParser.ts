import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { decodeHtml, htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeforcesProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns: string[] = [];

    [
      'https://codeforces.com/contest/*/problem/*',
      'https://codeforces.com/problemset/problem/*/*',
      'https://codeforces.com/gym/*/problem/*',
      'https://codeforces.com/group/*/contest/*/problem/*',
      'https://codeforces.com/problemsets/acmsguru/problem/*/*',
    ].forEach(pattern => {
      patterns.push(pattern);
      patterns.push(pattern.replace('https://', 'http://'));
      patterns.push(pattern.replace('https://codeforces.com', 'https://*.codeforces.com'));
      patterns.push(pattern.replace('https://codeforces.com', 'http://*.codeforces.com'));
    });

    return patterns;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const task = new TaskBuilder().setUrl(url);

    if (url.includes('/problemsets/acmsguru')) {
      const elem = htmlToElement(html);
      const table = elem.querySelector('.problemindexholder > .ttypography > .bordertable');

      if (table) {
        this.parseAcmSguRuProblemInsideTable(html, task);
      } else {
        this.parseAcmSguRuProblemNotInsideTable(html, task);
      }
    } else {
      this.parseMainProblem(html, task);
    }

    return task.build();
  }

  private parseMainProblem(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problem-statement > .header > .title').textContent.trim());
    task.setGroup(elem.querySelector('.rtable > tbody > tr > th').textContent.trim());

    const interactiveKeywords = ['Interaction', 'Протокол взаимодействия'];
    const isInteractive = [...elem.querySelectorAll('.section-title')].some(
      el => interactiveKeywords.indexOf(el.textContent) > -1,
    );

    task.setInteractive(isInteractive);

    const timeLimitStr = elem
      .querySelector('.problem-statement > .header > .time-limit')
      .childNodes[1].textContent.split(' ')[0];
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem
      .querySelector('.problem-statement > .header > .memory-limit')
      .childNodes[1].textContent.split(' ')[0];
    task.setMemoryLimit(parseInt(memoryLimitStr, 10));

    const inputFile = elem.querySelector('.problem-statement > .header > .input-file').childNodes[1].textContent;
    if (inputFile !== 'standard input' && inputFile !== 'стандартный ввод') {
      task.setInput({
        fileName: inputFile,
        type: 'file',
      });
    }

    const outputFile = elem.querySelector('.problem-statement > .header > .output-file').childNodes[1].textContent;
    if (outputFile !== 'standard output' && outputFile !== 'стандартный вывод') {
      task.setOutput({
        fileName: outputFile,
        type: 'file',
      });
    }

    const inputs = elem.querySelectorAll('.input pre');
    const outputs = elem.querySelectorAll('.output pre');

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      const input = decodeHtml(inputs[i].innerHTML);
      const output = decodeHtml(outputs[i].innerHTML);

      task.addTest(input, output);
    }
  }

  private parseAcmSguRuProblemInsideTable(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problemindexholder h3').textContent.trim());
    task.setGroup('Codeforces - acm.sgu.ru archive');

    task.setTimeLimit(parseFloat(/time limit per test: ([0-9.]+)\s+sec/.exec(html)[1]) * 1000);
    task.setMemoryLimit(Math.floor(parseInt(/memory limit per test: (\d+)\s+ KB/.exec(html)[1], 10) / 1000));

    const blocks = elem.querySelectorAll('font > pre');
    for (let i = 0; i < blocks.length; i += 2) {
      const input = blocks[i].textContent;
      const output = blocks[i + 1].textContent;

      task.addTest(input, output);
    }
  }

  private parseAcmSguRuProblemNotInsideTable(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problemindexholder h4').textContent.trim());
    task.setGroup('Codeforces - acm.sgu.ru archive');

    task.setTimeLimit(parseFloat(/Time limit per test: ([0-9.]+)\s+sec/i.exec(html)[1]) * 1000);

    task.setMemoryLimit(
      Math.floor(parseInt(/Memory limit(?: per test)*: (\d+)\s+(?:kilobytes|KB)/i.exec(html)[1], 10) / 1000),
    );

    elem.querySelectorAll('table').forEach(table => {
      const blocks = table.querySelectorAll('pre');

      if (blocks.length === 4) {
        const input = blocks[2].textContent;
        const output = blocks[3].textContent;

        task.addTest(input, output);
      }
    });
  }
}
