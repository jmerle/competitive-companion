import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

interface ProblemDetails {
  files: {
    input: string;
    output: string;
  };
  source: string;
  time: number;
  memory: number;
}

export class PBInfoProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['', 'www.', 'new.'].map(domain => `https://${domain}pbinfo.ro/probleme/*`);
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('PBInfo').setUrl(url);

    const isNew = url.includes('new');

    this.parseTitle(elem, task, isNew);
    this.parseDetails(elem, task, isNew);
    this.parseTests(html, task);

    return task.build();
  }

  private parseTitle(elem: Element, task: TaskBuilder, isNew: boolean): void {
    const titleElement = isNew
      ? elem.querySelector('h1.py-5 > div').lastChild
      : elem.querySelector('h1.text-primary > a');
    const title = titleElement.textContent.trim();
    task.setName(title);
  }

  private parseDetails(elem: Element, task: TaskBuilder, isNew: boolean): void {
    const detailsTable = document.querySelector('table tbody');
    if (!detailsTable) {
      throw new Error('Details table not found.');
    }

    const cells = Array.from(detailsTable.querySelectorAll('td')).map(cell => cell.textContent.trim());
    if (cells.length < 8) {
      throw new Error('Insufficient details found in the table.');
    }

    let details: ProblemDetails;

    if (!isNew) {
      const files = cells[2].split(' / ');
      const timeLimitMatch = /(\d+(?:\.\d+)?)\s* secunde/i.exec(cells[3]);
      const memoryLimitMatch = /(\d+(?:\.\d+)?)\s* MB/i.exec(cells[4]);

      details = {
        files: {
          input: this.trimZeroWidth(files[0]),
          output: this.trimZeroWidth(files[1]),
        },
        source: cells[5] === '-' ? '' : cells[5],
        time: parseFloat(timeLimitMatch ? timeLimitMatch[1] : '0'),
        memory: parseInt(memoryLimitMatch ? memoryLimitMatch[1] : '0'),
      };
    } else {
      // This is where stuff gets a bit more complicated because of a bug in
      // how new.pbinfo.ro displays the info.

      const fileName = Array.from(elem.querySelectorAll('p > code')).find(code => code.textContent.endsWith('.in'));

      const timeLimitMatch = /(\d+(?:\.\d+)?)\s*secunde/i.exec(cells[4]);
      const memoryLimitMatch = /(\d+)\s*MB/i.exec(cells[5].split(' / ')[0]);

      if (fileName) {
        details = {
          files: {
            input: this.trimZeroWidth(fileName.textContent),
            output: this.trimZeroWidth(fileName.textContent.replace('.in', '.out')),
          },
          source: cells[6] === '-' ? '' : cells[6],
          time: parseFloat(timeLimitMatch ? timeLimitMatch[1] : '0'),
          memory: parseInt(memoryLimitMatch ? memoryLimitMatch[1] : '0'),
        };
      }
    }

    const isStdin = !details.files.input.endsWith('.in');
    const isStdout = !details.files.output.endsWith('.out');

    task.setInput({
      type: isStdin ? 'stdin' : 'file',
      fileName: isStdin ? undefined : details.files.input,
    });

    task.setOutput({
      type: isStdout ? 'stdout' : 'file',
      fileName: isStdout ? undefined : details.files.output,
    });

    task.setCategory(details.source);
    task.setTimeLimit(details.time * 1000);
    task.setMemoryLimit(details.memory);
  }

  public parseTests(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);
    const tests = Array.from(elem.querySelectorAll('pre[contenteditable="true"]')).map(x => x.textContent);
    for (let i = 0; i < tests.length; i += 2) {
      if (i + 1 < tests.length) {
        task.addTest(tests[i], tests[i + 1]);
      }
    }
  }

  private trimZeroWidth(text: string): string {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  }
}
