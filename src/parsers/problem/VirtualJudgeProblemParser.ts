import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class VirtualJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://vjudge.net/problem/*',
      'https://cn.vjudge.net/problem/*',
      'https://vjudge.net/contest/*#problem/*',
      'https://cn.vjudge.net/contest/*#problem/*',
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(async resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      if (elem.querySelector('#problem-title') === null) {
        task.setName(elem.querySelector('#prob-title > h2').textContent);
        task.setGroup('Virtual Judge');
      } else {
        task.setName(elem.querySelector('h2#problem-title').textContent);
        task.setGroup('Virtual Judge - ' + elem.querySelector('#time-info > .row > .col-xs-6 > h3').textContent.trim());
      }

      const timeLimitDt = [...elem.querySelectorAll('dt')].find((el: Element) =>
        el.textContent.toLowerCase().includes('time limit'),
      );

      const memoryLimitDt = [...elem.querySelectorAll('dt')].find((el: Element) =>
        el.textContent.toLowerCase().includes('memory limit'),
      );

      const inputFileDt = [...elem.querySelectorAll('dt')].find((el: Element) =>
        el.textContent.toLowerCase().includes('input file'),
      );

      const outputFileDt = [...elem.querySelectorAll('dt')].find((el: Element) =>
        el.textContent.toLowerCase().includes('output file'),
      );

      if (timeLimitDt !== undefined) {
        const timeLimitStr = timeLimitDt.nextElementSibling.textContent;
        task.setTimeLimit(parseFloat(timeLimitStr.split(' ')[0]));
      }

      if (memoryLimitDt !== undefined) {
        const memoryLimitStr = memoryLimitDt.nextElementSibling.textContent;
        task.setMemoryLimit(Math.floor(parseFloat(memoryLimitStr.split(' ')[0]) / 1000));
      }

      if (inputFileDt !== undefined) {
        task.setInput({
          fileName: inputFileDt.nextElementSibling.textContent.trim(),
          type: 'file',
        });
      }

      if (outputFileDt !== undefined) {
        task.setOutput({
          fileName: outputFileDt.nextElementSibling.textContent.trim(),
          type: 'file',
        });
      }

      if (!url.includes('TopCoder-')) {
        try {
          const iframeUrl = (elem.querySelector('.row > iframe') as any).src;
          const iframeContent = await this.fetch(iframeUrl);
          const iframe = htmlToElement(iframeContent);

          const codeBlocks = this.getCodeBlocksFromDescription(iframe);
          for (let i = 0; i + 1 < codeBlocks.length; i += 2) {
            task.addTest(codeBlocks[i], codeBlocks[i + 1]);
          }
        } catch (err) {}
      }

      resolve(task.build());
    });
  }

  private getCodeBlocksFromDescription(elem: Element): string[] {
    if (elem.querySelectorAll('dd').length === 1) {
      const block = elem.querySelector('dd');

      const preTags = [...block.querySelectorAll('pre')]
        .map((el: Element) => {
          if (el.querySelector('strong,b') !== null) {
            return [...el.childNodes]
              .filter((node: ChildNode) => node.nodeType === Node.TEXT_NODE)
              .map((node: ChildNode) => node.textContent.trim());
          }

          if (el.querySelector('code') !== null) {
            return [el.querySelector('code').innerHTML.trim()];
          }

          return [el.innerHTML.trim()];
        })
        .reduce((a, b) => [...a, ...b], []);

      const monospaceBlocks = [...block.querySelectorAll('div[style="font-family:Monospace, Courier;"] > b')].map(
        (el: Element) => el.innerHTML.trim(),
      );

      return [].concat(preTags, monospaceBlocks);
    } else {
      const blocks = [...elem.querySelectorAll('dt')]
        .filter((el: Element) => el.textContent.includes('ample'))
        .map((el: Element) => el.nextElementSibling);

      const preTags = blocks
        .map((el: Element) => [...el.querySelectorAll('pre')])
        .reduce((a, b) => [...a, ...b], [])
        .map((el: Element) => el.innerHTML.trim());

      const paragraphs = blocks
        .filter((el: Element) => el.children.length === 1 && el.querySelector('p') !== null)
        .map((el: Element) => el.querySelector('p').innerHTML.trim());

      const spanTags = blocks
        .map((el: Element) => {
          return [...el.querySelectorAll('span[style=\'font-family:"Courier New"\']')]
            .map((span: Element) => span.textContent)
            .join('\n');
        })
        .filter(str => str.length > 0);

      return [].concat(preTags, paragraphs, spanTags);
    }
  }
}
