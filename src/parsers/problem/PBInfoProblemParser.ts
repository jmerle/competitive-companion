import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PBInfoProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['', 'www.', 'new.'].map(domain => `https://${domain}pbinfo.ro/probleme/*`);
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('PBInfo').setUrl(url);

    const isNew = url.includes('new');

    await this.parseTitle(elem, task, isNew);
    this.parseDetails(elem, task, isNew);
    this.parseTests(html, task);

    return task.build();
  }

  private async parseTitle(elem: Element, task: TaskBuilder, isNew: boolean): Promise<void> {
    const titleElement = isNew
      ? elem.querySelector('h1.py-5 > div').lastChild
      : elem.querySelector('h1.text-primary > a');
    await task.setName(titleElement.textContent.trim());
  }

  private parseDetails(elem: Element, task: TaskBuilder, isNew: boolean): void {
    const detailsTable = document.querySelector('table tbody');
    const cells = Array.from(detailsTable.querySelectorAll('td')).map(cell => cell.textContent.trim());

    if (!isNew) {
      task.setCategory(cells[5] === '-' ? '' : cells[5]);

      const files = cells[2].split(' / ');
      this.setInputOutput(task, this.trimZeroWidth(files[0]), this.trimZeroWidth(files[1]));

      const timeLimitMatch = /(\d+(?:\.\d+)?)\s* secunde/i.exec(cells[3]);
      const memoryLimitMatch = /(\d+(?:\.\d+)?)\s* MB/i.exec(cells[4]);

      task.setTimeLimit(parseFloat(timeLimitMatch ? timeLimitMatch[1] : '0') * 1000);
      task.setMemoryLimit(parseInt(memoryLimitMatch ? memoryLimitMatch[1] : '0'));
    } else {
      // This is where stuff gets a bit more complicated because of a bug in
      // how new.pbinfo.ro displays the info.

      task.setCategory(cells[6] === '-' ? '' : cells[6]);

      const fileName = Array.from(elem.querySelectorAll('p > code')).find(code => code.textContent.endsWith('.in'));
      if (fileName) {
        this.setInputOutput(
          task,
          this.trimZeroWidth(fileName.textContent),
          this.trimZeroWidth(fileName.textContent.replace('.in', '.out')),
        );
      }

      const timeLimitMatch = /(\d+(?:\.\d+)?)\s*secunde/i.exec(cells[4]);
      const memoryLimitMatch = /(\d+)\s*MB/i.exec(cells[5].split(' / ')[0]);

      task.setTimeLimit(parseFloat(timeLimitMatch ? timeLimitMatch[1] : '0') * 1000);
      task.setMemoryLimit(parseInt(memoryLimitMatch ? memoryLimitMatch[1] : '0'));
    }
  }

  private setInputOutput(task: TaskBuilder, inputFile: string, outputFile: string): void {
    const isStdin = !inputFile.endsWith('.in');
    const isStdout = !outputFile.endsWith('.out');

    task.setInput({
      type: isStdin ? 'stdin' : 'file',
      fileName: isStdin ? undefined : inputFile,
    });

    task.setOutput({
      type: isStdout ? 'stdout' : 'file',
      fileName: isStdout ? undefined : outputFile,
    });
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
