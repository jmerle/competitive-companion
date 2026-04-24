import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PTAProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://pintia.cn/problem-sets/*/exam/problems/type/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('PTA').setUrl(url);

    const problemPanel = elem.querySelector('#exam-app .left_rtQmv, #exam-app .splitArea_DF4tO .left_rtQmv');
    const titleElement = problemPanel?.querySelector(
      [
        'span.text-darkest.font-bold.text-lg',
        '.text-darkest.font-bold.text-lg',
        '.p-4 .font-bold.text-lg',
      ].join(', '),
    );
    if (titleElement === null) {
      throw new Error('Could not determine the PTA problem title');
    }

    task.setName(titleElement.textContent.trim());

    const categoryElement = elem.querySelector(
      [
        '#PROGRAMMING .text-sm.font-black',
        '#exam-app a.active-anchor .text-sm.font-black',
        '#exam-app a.active .text-sm.font-black',
      ].join(', '),
    );
    task.setCategory(categoryElement?.textContent?.trim() || '');

    const limitations = this.parseLimitations(elem);
    if (limitations.timeLimit !== null) {
      task.setTimeLimit(limitations.timeLimit);
    }
    if (limitations.memoryLimit !== null) {
      task.setMemoryLimit(limitations.memoryLimit);
    }

    const samples = this.parseSamples(elem);
    const fallbackSamples = samples.length > 0 ? samples : this.parseSamplesFromLanguageBlocks(elem);

    if (fallbackSamples.length > 0) {
      for (const sample of fallbackSamples) {
        task.addTest(sample.input, sample.output);
      }
    } else {
      const blocks = [...elem.querySelectorAll('.rendered-markdown pre > code:not(.hljs), .rendered-markdown > pre')];

      for (let i = 0; i < blocks.length - 1; i += 2) {
        task.addTest(blocks[i].textContent || '', blocks[i + 1].textContent || '');
      }
    }

    if (task.tests.length === 0) {
      throw new Error('Could not extract any PTA sample tests');
    }

    return task.build();
  }

  private parseLimitations(elem: Element): { timeLimit: number | null; memoryLimit: number | null } {
    let timeLimit: number | null = null;
    let memoryLimit: number | null = null;

    for (const item of elem.querySelectorAll('.problemInfo_HVczC .item_YVmJd, [class*="problemInfo"] .item_YVmJd')) {
      const texts = [...item.querySelectorAll('.pc-text-raw')]
        .map(node => node.textContent?.trim() || '')
        .filter(Boolean);

      if (texts.length < 2) {
        continue;
      }

      const [label, value] = texts;

      if (label === 'Time Limit') {
        const match = value.match(/(\d+)/);
        if (match !== null) {
          timeLimit = parseInt(match[1], 10);
        }
      } else if (label === 'Memory Limit') {
        const match = value.match(/(\d+)/);
        if (match !== null) {
          memoryLimit = parseInt(match[1], 10);
        }
      }
    }

    return { timeLimit, memoryLimit };
  }

  private parseSamples(elem: Element): { input: string; output: string }[] {
    const sampleMap = new Map<number, { input?: string; output?: string }>();
    let nextUnnamedIndex = 1;

    for (const header of elem.querySelectorAll('h3')) {
      const sampleInfo = this.parseSampleHeader(header.textContent || '');
      if (sampleInfo === null) {
        continue;
      }

      const text = this.extractSectionCodeBlocks(header, sampleInfo.kind === 'input' ? ['in'] : ['out']);
      if (text.length === 0) {
        continue;
      }

      const index = sampleInfo.index ?? nextUnnamedIndex++;
      const sample = sampleMap.get(index) || {};
      sample[sampleInfo.kind] = text.join('\n');
      sampleMap.set(index, sample);
    }

    return [...sampleMap.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, sample]) => sample)
      .filter((sample): sample is { input: string; output: string } => !!sample.input && !!sample.output);
  }

  private parseSamplesFromLanguageBlocks(elem: Element): { input: string; output: string }[] {
    const samples: { input: string; output: string }[] = [];
    let pendingInput: string | null = null;

    for (const block of elem.querySelectorAll('[data-lang="in"], [data-lang="out"]')) {
      const lang = block.getAttribute('data-lang');
      const text = this.extractCodeBlockText(block);
      if (text === null) {
        continue;
      }

      if (lang === 'in') {
        pendingInput = text;
      } else if (lang === 'out' && pendingInput !== null) {
        samples.push({
          input: pendingInput,
          output: text,
        });
        pendingInput = null;
      }
    }

    return samples;
  }

  private parseSampleHeader(text: string): { kind: 'input' | 'output'; index: number | null } | null {
    const normalized = text.trim();
    const inputMatch = normalized.match(/(?:输入样例|Sample Input)\s*(\d+)?/i);
    if (inputMatch !== null) {
      return {
        kind: 'input',
        index: inputMatch[1] ? parseInt(inputMatch[1], 10) : null,
      };
    }

    const outputMatch = normalized.match(/(?:输出样例|Sample Output)\s*(\d+)?/i);
    if (outputMatch !== null) {
      return {
        kind: 'output',
        index: outputMatch[1] ? parseInt(outputMatch[1], 10) : null,
      };
    }

    return null;
  }

  private extractSectionCodeBlocks(header: Element, langs: string[]): string[] {
    const blocks: string[] = [];
    let element = header.nextElementSibling;

    while (element !== null && element.tagName !== 'H3') {
      const lang = element.getAttribute('data-lang');
      const text = this.extractCodeBlockText(element);

      if (text !== null && (langs.length === 0 || lang === null || langs.includes(lang))) {
        blocks.push(text);
      }

      element = element.nextElementSibling;
    }

    return blocks;
  }

  private extractCodeBlockText(block: Element): string | null {
    const lineElements = block.querySelectorAll('.cm-content .cm-line');
    if (lineElements.length > 0) {
      return [...lineElements].map(line => line.textContent || '').join('\n');
    }

    const codeElement = block.querySelector('code');
    if (codeElement !== null) {
      return codeElement.textContent || '';
    }

    if (block.matches('pre')) {
      return block.textContent || '';
    }

    return null;
  }
}
