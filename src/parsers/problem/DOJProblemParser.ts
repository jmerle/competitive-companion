import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class DOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://dojoi.xyz/*/problems/*',
      'https://dojoi.xyz/problems/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    // 문제 제목
    const titleEl = elem.querySelector('h1') ?? elem.querySelector('h2');
    task.setName(titleEl ? titleEl.textContent!.trim() : 'DOJ Problem');

    // 그룹
    task.setGroup('DOJ');

    // 시간/메모리 제한 (있으면 파싱, 없으면 기본값)
    const metaText = elem.body?.textContent ?? '';

    const timeMatch = metaText.match(/(\d+)\s*(?:ms|초|second)/i);
    if (timeMatch) {
      task.setTimeLimit(parseInt(timeMatch[1], 10));
    }

    const memMatch = metaText.match(/(\d+)\s*(?:MB|mb)/i);
    if (memMatch) {
      task.setMemoryLimit(parseInt(memMatch[1], 10));
    }

    // 예제 입출력 파싱
    // 구조: .sample-block > .sample-pair > .copyable-code-block:nth(0) input, nth(1) output
    const sampleBlocks = elem.querySelectorAll('.sample-block');

    for (const block of sampleBlocks) {
      const codeBlocks = block.querySelectorAll('.code-block');
      if (codeBlocks.length >= 2) {
        const input = codeBlocks[0].textContent!.trim() + '\n';
        const output = codeBlocks[1].textContent!.trim() + '\n';
        task.addTest(input, output);
      }
    }

    return task.build();
  }
}