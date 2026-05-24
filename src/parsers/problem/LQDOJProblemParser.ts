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

    // 1. Cào tên bài toán
    const titleElem = elem.querySelector('.problem-title .title-row');
    if (titleElem) {
      task.setName(titleElem.textContent.trim());
    }

    // 2. Cào Time Limit và Memory Limit
    const infoBlocks = elem.querySelectorAll('.info-block');
    for (const block of infoBlocks) {
      const piName = block.querySelector('.pi-name');
      const piValue = block.querySelector('.new-pi-value');

      if (piName && piValue) {
        const text = piName.textContent.toLowerCase();
        const value = piValue.textContent.trim();

        if (text.includes('time limit')) {
          task.setTimeLimit(parseFloat(value) * 1000); // Đổi từ giây (s) sang mili-giây (ms)
        } else if (text.includes('memory limit')) {
          task.setMemoryLimit(parseInt(value, 10)); // Lấy trực tiếp phần số của "256M"
        }
      }
    }

    // 3. Cào Test Cases (Input / Output)
    const details = elem.querySelectorAll('details');
    let currentInput = '';

    for (const detail of details) {
      const summary = detail.querySelector('summary');
      if (!summary) continue;

      const summaryText = summary.textContent.trim().toLowerCase();
      const codeBlock = detail.querySelector('pre > code');

      if (!codeBlock) continue;

      if (summaryText.includes('input')) {
        currentInput = codeBlock.textContent;
      } else if (summaryText.includes('output') && currentInput !== '') {
        task.addTest(currentInput, codeBlock.textContent);
        currentInput = '';
      }
    }

    return task.build();
  }
}
