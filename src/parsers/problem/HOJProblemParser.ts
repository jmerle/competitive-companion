import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://www.ylcourt.cn/problem/*',
      'http://www.ylcourt.cn/contest/*/problem/*',
      'https://lzuoj.lzu.edu.cn/problem/*',
      'https://lzuoj.lzu.edu.cn/contest/*/problem/*',
      
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HOJ').setUrl(url);

    // 获取题目名称
    const nameElem = elem.querySelector('.panel-title > span:first-child');
    task.setName(nameElem ? nameElem.textContent.trim() : 'Unknown Problem');

    // 提取时间和内存限制
    const questionIntr = elem.querySelector('.question-intr');
    if (questionIntr) {
      const limitsText = questionIntr.textContent;
      
      const timeLimitMatch = /时间限制[：:]\s*C\/C\+\+\s*(\d+)\s*MS/.exec(limitsText);
      if (timeLimitMatch) {
        task.setTimeLimit(parseInt(timeLimitMatch[1], 10));
      }
      
      const memoryLimitMatch = /内存限制[：:]\s*C\/C\+\+\s*(\d+)\s*MB/.exec(limitsText);
      if (memoryLimitMatch) {
        task.setMemoryLimit(parseInt(memoryLimitMatch[1], 10));
      }
    }

    // 提取测试用例
    const exampleContainers = elem.querySelectorAll('.flex-container.example');
    
    for (const container of Array.from(exampleContainers)) {
      const inputBlock = container.querySelector('.example-input');
      const outputBlock = container.querySelector('.example-output');
      
      if (inputBlock && outputBlock) {
        const inputPre = inputBlock.querySelector('pre');
        const outputPre = outputBlock.querySelector('pre');
        
        if (inputPre && outputPre) {
          const input = this.cleanContent(inputPre.textContent);
          const output = this.cleanContent(outputPre.textContent);
          
          if (input && output) {
            task.addTest(input, output);
          }
        }
      }
    }

    return task.build();
  }

  private cleanContent(content: string): string {
    if (!content) return '';
    // 移除首尾空白，保留内部格式
    return content.trim();
  }
}