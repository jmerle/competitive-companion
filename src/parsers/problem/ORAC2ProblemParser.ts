// Made by Cyclate 2025 - Australia
// Shout out to the land down under!

import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { readPdf } from '../../utils/pdf';
import { Parser } from '../Parser';

const RE_TERMINATION = /^(explanation|scoring)/i;
const RE_TIME = /([\d.]+)\s*second/i;
const RE_MEMORY = /([\d.]+)\s*MiB/i;
const RE_SAMPLE_HEADER = /sample\s+(input|output)(?:\s*(\d+))?/i;
const RE_PAGE_NUMBER = /^\s*\d+\s+of\s+\d+\s*$/i;

export class ORAC2ProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://orac2.info/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const task = new TaskBuilder('ORAC2').setUrl(url);
    task.setGroup('ORAC2');

    const elem = htmlToElement(html);
    task.setName(elem.querySelector('h1.mb-0').textContent.trim());

    const [timeCell, memoryCell, inputCell, outputCell] = Array.from(
      elem.querySelectorAll('table.table-fixed tbody tr td'),
    );

    task.setTimeLimit(parseFloat(RE_TIME.exec(timeCell.textContent)[1]) * 1000);
    task.setMemoryLimit(parseInt(RE_MEMORY.exec(memoryCell.textContent)[1], 10));

    if (inputCell && outputCell) {
      task.setInput({ type: 'file', fileName: inputCell.textContent.trim() });
      task.setOutput({ type: 'file', fileName: outputCell.textContent.trim() });
    } else {
      task.setInput({ type: 'stdin' });
      task.setOutput({ type: 'stdout' });
    }

    const pdfUrl = url.endsWith('/') ? `${url}statement.pdf` : `${url}/statement.pdf`;
    const pdfLines = await readPdf(pdfUrl);

    this.parseSampleTestsFromPdf(task, pdfLines);

    return task.build();
  }

  private parseSampleTestsFromPdf(task: TaskBuilder, lines: string[]): void {
    let inputBuffer: string[] = [];
    let outputBuffer: string[] = [];

    let currentType: 'input' | 'output' | null = null;
    let isReadingSample = true;

    const removePageNumber = (line: string): string => line.replace(/^\d+|\d+$/g, '').trim();
    const pdfHeader = removePageNumber(lines[0]);

    for (const line of lines) {
      if (removePageNumber(line) === pdfHeader || RE_PAGE_NUMBER.test(line.trim())) continue;

      if (RE_TERMINATION.test(line.trim())) {
        isReadingSample = false;
        continue;
      }

      const match = RE_SAMPLE_HEADER.exec(line);

      if (match) {
        if (inputBuffer.length && outputBuffer.length) {
          task.addTest(inputBuffer.join(''), outputBuffer.join(''));

          inputBuffer = [];
          outputBuffer = [];
        }
        currentType = match[1].toLowerCase() as 'input' | 'output';
        if (currentType === 'input') {
          inputBuffer = [];
        } else if (currentType === 'output') {
          outputBuffer = [];
        }

        isReadingSample = true;
      } else if (currentType && isReadingSample === true) {
        const lineContent = line.trim() + '\n';

        if (currentType === 'input') {
          inputBuffer.push(lineContent);
        } else {
          outputBuffer.push(lineContent);
        }
      }
    }

    if (inputBuffer.length && outputBuffer.length) {
      task.addTest(inputBuffer.join(''), outputBuffer.join(''));
    }
  }
}
