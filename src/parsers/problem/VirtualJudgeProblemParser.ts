import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class VirtualJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://vjudge.net/problem/*',
      'https://cn.vjudge.net/problem/*',
      'https://vjudge.csgrandeur.cn/problem/*',
      'https://vjudge.net/contest/*#problem/*',
      'https://cn.vjudge.net/contest/*#problem/*',
      'https://vjudge.csgrandeur.cn/contest/*#problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Virtual Judge').setUrl(url);

    if (elem.querySelector('#problem-title') === null) {
      task.setName(elem.querySelector('#prob-title > h2').textContent);
      task.setCategory(window.location.href.split('/').pop().split('-')[0]);
    } else {
      task.setName(elem.querySelector('h2#problem-title').textContent);
      task.setCategory(elem.querySelector('#time-info > .row > .col-xs-6 > h3').textContent.trim());
    }

    const timeLimitDt = [...elem.querySelectorAll('dt')].find(el =>
      el.textContent.toLowerCase().includes('time limit'),
    );

    const memoryLimitDt = [...elem.querySelectorAll('dt')].find(
      el => el.textContent.toLowerCase().includes('memory limit') || el.textContent.toLowerCase().includes('mem limit'),
    );

    const inputFileDt = [...elem.querySelectorAll('dt')].find(el =>
      el.textContent.toLowerCase().includes('input file'),
    );

    const outputFileDt = [...elem.querySelectorAll('dt')].find(el =>
      el.textContent.toLowerCase().includes('output file'),
    );

    if (timeLimitDt !== undefined) {
      const timeLimitStr = timeLimitDt.nextElementSibling.textContent;
      task.setTimeLimit(parseFloat(timeLimitStr.split(' ')[0]));
    }

    if (memoryLimitDt !== undefined) {
      const memoryLimitStr = memoryLimitDt.nextElementSibling.textContent;
      task.setMemoryLimit(parseFloat(memoryLimitStr.split(' ')[0]) / 1024);
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
        const iframe = [...elem.querySelectorAll<HTMLIFrameElement>('#prob-right-panel iframe')].find(
          el => el.style.display !== 'none',
        );

        const iframeUrl = iframe.src;
        const iframeContent = await this.fetch(iframeUrl);
        const jsonContainer = htmlToElement(iframeContent).querySelector('.data-json-container');
        const json = JSON.parse(jsonContainer.textContent);

        const codeBlocks = VirtualJudgeProblemParser.getCodeBlocksFromDescription(json);
        for (let i = 0; i < codeBlocks.length - 1; i += 2) {
          task.addTest(codeBlocks[i], codeBlocks[i + 1]);
        }
      } catch (err) {
        // Do nothing
      }
    }

    return task.build();
  }

  public static getCodeBlocksFromDescription(json: any): string[] {
    if (json.sections.length === 1) {
      const block = htmlToElement(json.sections[0].value.content);

      const preTags = [...block.querySelectorAll('pre')]
        .map(el => {
          if (el.querySelector('strong, b') !== null) {
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

      const monospaceSelector = 'div[style="font-family:Monospace, Courier;"] > b';
      const monospaceBlocks = [...block.querySelectorAll(monospaceSelector)].map(el => el.innerHTML.trim());

      return [].concat(preTags, monospaceBlocks);
    } else {
      const blocks = (json.sections as any[])
        .filter(section => section.title.includes('ample'))
        .map(section => htmlToElement(section.value.content));

      const preTags = blocks
        .map(el => [...el.querySelectorAll('pre')])
        .reduce((a, b) => [...a, ...b], [])
        .filter(el => el.querySelector('pre') === null)
        .map(el => el.innerHTML.trim());

      const paragraphs = blocks
        .filter(el => el.children.length === 1 && el.querySelector('p') !== null)
        .map(el => el.querySelector('p').innerHTML.trim());

      const spanTags = blocks
        .map(el => {
          return [...el.querySelectorAll('span[style=\'font-family:"Courier New"\']')]
            .map((span: Element) => span.textContent)
            .join('\n');
        })
        .filter(str => str.length > 0);

      const codeBlocks = [].concat(preTags, paragraphs, spanTags);

      if (codeBlocks.length > 0) {
        return codeBlocks;
      }

      return blocks.map((el: Element) => {
        return VirtualJudgeProblemParser.getTextFromElement(el);
      });
    }
  }

  private static getTextFromElement(el: Element): string {
    if (el.childNodes.length === 0 || el.nodeType === Node.TEXT_NODE) {
      return el.textContent.replace(/<br>/g, '\n').trim();
    }

    return [...el.childNodes]
      .map(child => this.getTextFromElement(child as any))
      .filter(str => str.length > 0)
      .join('\n');
  }
}
