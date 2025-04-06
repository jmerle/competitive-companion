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

export class InfoArenaProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns: string[] = [];
    for (const domain of ['infoarena', 'nerdarena']) {
      for (const prefix of ['', 'www.']) {
        patterns.push(`https://${prefix}${domain}.ro/problema/*`);
      }
    }

    return patterns;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const judge = new URL(url).hostname.includes('infoarena.ro') ? 'InfoArena' : 'NerdArena';

    const elem = htmlToElement(html);
    const task = new TaskBuilder(judge).setUrl(url);

    await this.parseTitle(elem, task);
    this.parseDetails(elem, task);
    this.parseTests(html, task);

    return task.build();
  }

  private async parseTitle(elem: Element, task: TaskBuilder): Promise<void> {
    await task.setName(elem.querySelector('.wiki_text_block > h1').textContent.trim());
  }

  private parseDetails(elem: Element, task: TaskBuilder): void {
    const detailsTable = elem.querySelector('.wiki_text_block > table tbody');
    const cells = Array.from(detailsTable.querySelectorAll('tr > td:nth-child(2n)')).map(cell =>
      cell.textContent.trim(),
    );

    const files = cells[0].split(', ');
    const timeLimitMatch = /(\d+(?:\.\d+)?)\s*sec/i.exec(cells[4]);
    const memoryLimitMatch = /(\d+(?:\.\d+)?)\s*KB/i.exec(cells[5]);

    const details: ProblemDetails = {
      files: {
        input: this.trimZeroWidth(files[0]),
        output: this.trimZeroWidth(files[1]),
      },
      source: cells[1],
      time: parseFloat(timeLimitMatch ? timeLimitMatch[1] : '0'),
      memory: parseInt(memoryLimitMatch ? memoryLimitMatch[1] : '0'),
    };

    const isStdin = !details.files.input.endsWith('.in');
    const isStdout = !details.files.output.endsWith('.out');

    const isInteractive = elem.querySelector('h2').textContent.startsWith('Interac');

    if (isStdin || isInteractive) {
      task.setInput({
        type: 'stdin',
      });
    } else {
      task.setInput({
        type: 'file',
        fileName: details.files.input,
      });
    }

    if (isStdout || isInteractive) {
      task.setOutput({
        type: 'stdout',
      });
    } else {
      task.setOutput({
        type: 'file',
        fileName: details.files.output,
      });
    }

    task.setInteractive(isInteractive);
    task.setCategory(details.source);
    task.setTimeLimit(details.time * 1000);

    // This is because it seems like competitive-companion can't handle decimal
    // numbers in the memory limit (512 KB, for example), so I am just rounding
    // it up and hoping for the best. It would've been great if the memory limit
    // was in KB, not MB, but it doesn't matter.
    task.setMemoryLimit(Math.ceil(details.memory / 1024.0));
  }

  public parseTests(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    const exampleTable = elem.querySelector('h2 + table.example');
    const rows = exampleTable.querySelectorAll('tbody tr');

    const isInteractive = elem.querySelector('h2').textContent.startsWith('Interac');

    // Interactive problems need a bit more care, since the examples alternate
    // between stdin and stdout
    let input = '';
    let output = '';
    const thCells = Array.from(rows[0].querySelectorAll('th')).map(cell => this.trimZeroWidth(cell.textContent));
    const isStdinFirst = thCells[0] === 'stdin';

    if (isInteractive) {
      for (let i = 1; i < rows.length; ++i) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length >= 2) {
          const leftText = this.trimZeroWidth(cells[0].textContent);
          const rightText = this.trimZeroWidth(cells[1].textContent);
          input += leftText + '\n';
          output += rightText + '\n';
        }
      }

      input = input.replaceAll(/\n\n/g, '\n');
      output = output.replaceAll(/\n\n/g, '\n');
      task.addTest(isStdinFirst ? input : output, isStdinFirst ? output : input);
    } else {
      for (let i = 1; i < rows.length; ++i) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length >= 2) {
          const leftText = this.trimZeroWidth(cells[0].textContent);
          const rightText = this.trimZeroWidth(cells[1].textContent);

          task.addTest(leftText, rightText);
        }
      }
    }
  }

  private trimZeroWidth(text: string): string {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  }
}
