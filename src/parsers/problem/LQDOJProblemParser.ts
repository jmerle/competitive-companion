import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LQDOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://lqdoj.edu.vn/problem/*',
      'http://lqdoj.edu.vn/problem/*'
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('LQDOJ').setUrl(url);

    // Get name
    const titleElem = elem.querySelector('.problem-title .title-row');
    if (titleElem) {
      task.setName(titleElem.textContent.trim());
    }

    // Get time and limit
    const infoBlocks = elem.querySelectorAll('.info-block');
    for (const block of infoBlocks) {
      const piName = block.querySelector('.pi-name');
      const piValue = block.querySelector('.new-pi-value');

      if (piName && piValue) {
        const text = piName.textContent.toLowerCase();
        const value = piValue.textContent.trim();

        if (text.includes('time limit')) {
          task.setTimeLimit(parseFloat(value) * 1000);
        } else if (text.includes('memory limit')) {
          task.setMemoryLimit(parseInt(value, 10));
        }
      }
    }

    // Remove Comment
    elem.querySelectorAll('#comments, .comments, [id*="comment"], [class*="comment"]').forEach(el => el.remove());

    const problemBody = elem.querySelector('.content-description') || elem.querySelector('.problem-statement') || elem;

    let foundTests = false;

    // New UI
    const details = problemBody.querySelectorAll('details');
    let currentInput = '';

    for (const detail of details) {
      const summary = detail.querySelector('summary');
      if (!summary) continue;

      const summaryText = summary.textContent.trim().toLowerCase();
      const codeBlock = detail.querySelector('pre > code') || detail.querySelector('pre');

      if (!codeBlock) continue;

      if (summaryText.includes('input')) {
        currentInput = codeBlock.textContent;
      } else if (summaryText.includes('output') && currentInput !== '') {
        task.addTest(currentInput, codeBlock.textContent);
        currentInput = '';
        foundTests = true;
      }
    }

    // Old UI
    if (!foundTests) {
      const highlightBlocks = problemBody.querySelectorAll('.highlight pre');

      for (let i = 0; i < highlightBlocks.length - 1; i += 2) {
        const inputCode = highlightBlocks[i].textContent;
        const outputCode = highlightBlocks[i + 1].textContent;
        task.addTest(inputCode, outputCode);
      }
    }

    return task.build();
  }
}
