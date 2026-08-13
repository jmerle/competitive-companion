import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class XinyouduiProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://xinyoudui.com/ac/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Xinyoudui').setUrl(url);

    this.parseTitle(task, elem, url);
    this.parseLimits(task, elem);
    this.parseSamples(task, elem);

    return task.build();
  }

  private parseTitle(task: TaskBuilder, elem: Element, url: string): void {
    const problemIdMatch = /\/problem\/(\d+)/.exec(url);
    if (problemIdMatch !== null) {
      const problemItem = elem.querySelector(`[id="problem-${problemIdMatch[1]}"]`);
      if (problemItem !== null) {
        const titleElem = problemItem.querySelector('[class*="_problemTitle_"]');
        if (titleElem !== null) {
          task.setName(titleElem.textContent.replace(/^\d+\.\s*/, '').trim());
          return;
        }
      }
    }

    const navTitle = elem.querySelector('#titleLink-id strong');
    if (navTitle !== null) {
      task.setName(navTitle.textContent.trim());
    }
  }

  private parseLimits(task: TaskBuilder, elem: Element): void {
    const limitItems = elem.querySelectorAll('blockquote .ac-ant-space-item');

    for (const item of limitItems) {
      const text = item.textContent.trim();

      const timeMatchMs = /时间限制[:：]\s*([0-9.]+)\s*ms/i.exec(text);
      if (timeMatchMs !== null) {
        task.setTimeLimit(parseFloat(timeMatchMs[1]));
      }

      const timeMatchS = /时间限制[:：]\s*([0-9.]+)\s*s/i.exec(text);
      if (timeMatchS !== null) {
        task.setTimeLimit(parseFloat(timeMatchS[1]) * 1000);
      }

      const memoryMatchKb = /空间限制[:：]\s*([0-9.]+)\s*kB/i.exec(text);
      if (memoryMatchKb !== null) {
        task.setMemoryLimit(parseFloat(memoryMatchKb[1]) / 1024);
      }

      const memoryMatchMb = /空间限制[:：]\s*([0-9.]+)\s*MB/i.exec(text);
      if (memoryMatchMb !== null) {
        task.setMemoryLimit(parseFloat(memoryMatchMb[1]));
      }
    }
  }

  private parseSamples(task: TaskBuilder, elem: Element): void {
    const sampleHeader = elem.querySelector('h3#样例');
    if (sampleHeader === null) {
      return;
    }

    const inputs: string[] = [];
    const outputs: string[] = [];
    let currentType: 'input' | 'output' | null = null;

    for (let node = sampleHeader.nextElementSibling; node !== null && node.tagName !== 'H3'; node = node.nextElementSibling) {
      if (node.tagName === 'H4') {
        if (/^input-/i.test(node.id)) {
          currentType = 'input';
        } else if (/^output-/i.test(node.id)) {
          currentType = 'output';
        } else {
          currentType = null;
        }
      } else if (node.tagName === 'PRE' && currentType !== null) {
        const copyElem = node.querySelector('[class*="_copy_"]');
        const content = this.cleanSample(copyElem !== null ? copyElem.textContent : node.textContent);

        if (currentType === 'input') {
          inputs.push(content);
        } else {
          outputs.push(content);
        }

        currentType = null;
      }
    }

    for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
      task.addTest(inputs[i], outputs[i]);
    }
  }

  private cleanSample(content: string): string {
    return content.replace(/^样例\d+[\r\n]?/, '').trimEnd();
  }
}
