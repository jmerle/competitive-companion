import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { readPdf } from '../../utils/pdf';
import { request } from '../../utils/request';
import { Parser } from '../Parser';
import { UVaOnlineJudgeProblemParser } from './UVaOnlineJudgeProblemParser';

export class VirtualJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://vjudge.net/problem/*',
      'https://vjudge.net.cn/problem/*',
      'https://vjudge.net/contest/*#problem/*',
      'https://vjudge.net.cn/contest/*#problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Virtual Judge').setUrl(url);
    const url_list = url.split('/');
    let pid = url_list[url_list.length - 1];

    pid = pid
      .replace('%E6%B4%9B%E8%B0%B7', 'LG')
      .replace('%E9%BB%91%E6%9A%97%E7%88%86%E7%82%B8', 'DarkBZOJ')
      .replace('%E8%AE%A1%E8%92%9C%E5%AE%A2', 'JSK');

    await task.setName('Vjudge ' + pid);
    if (elem.querySelector('#problem-title') === null) {
      // await task.setName(elem.querySelector('#prob-title > h2').textContent.trim());
      task.setCategory(window.location.href.split('/').pop().split('-')[0]);
    } else {
      // await task.setName(elem.querySelector('h2#problem-title').textContent.trim());
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
      task.setMemoryLimit((parseFloat(memoryLimitStr.split(' ')[0]) + 1) / 1024);
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

    try {
      if (url.includes('UVA-') || url.includes('UVALive-')) {
        const iframe = [...elem.querySelectorAll<HTMLIFrameElement>('#prob-right-panel iframe')].find(
          el => el.style.display !== 'none',
        );

        const iframeContent = await request(iframe.src);
        const pdfId = /CDN_BASE_URL\/([^?]+)\?v/.exec(iframeContent)[1];

        const pdfLines = await readPdf(`https://vj.csgrandeur.cn/${pdfId}`);

        const uvaParser = new UVaOnlineJudgeProblemParser();
        await uvaParser.parseTestsFromPdf(task, pdfLines);
      } else if (!url.includes('TopCoder-')) {
        const iframe = [...elem.querySelectorAll<HTMLIFrameElement>('#prob-right-panel iframe')].find(
          el => el.style.display !== 'none',
        );

        const iframeUrl = iframe.src;
        const iframeContent = await request(iframeUrl);
        const jsonContainer = htmlToElement(iframeContent).querySelector('.data-json-container');
        const json = JSON.parse(jsonContainer.textContent);

        const codeBlocks = this.getCodeBlocksFromDescription(json);
        for (let i = 0; i < codeBlocks.length - 1; i += 2) {
          task.addTest(codeBlocks[i], codeBlocks[i + 1]);
        }
      }
    } catch (err) {
      // Do nothing
    }

    return task.build();
  }

  public getCodeBlocksFromDescription(json: any): string[] {
    const html = `<div>${json.sections.map((section: any) => section.value.content).join('')}</div>`;
    const elem = htmlToElement(html);

    const tableBlocks = [...elem.querySelectorAll('.vjudge_sample pre')].map(el => el.textContent);
    if (tableBlocks.length > 0) {
      return tableBlocks;
    }

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
        return this.getTextFromElement(el);
      });
    }
  }

  private getTextFromElement(el: Element): string {
    if (el.childNodes.length === 0 || el.nodeType === Node.TEXT_NODE) {
      return el.textContent.replace(/<br>/g, '\n').trim();
    }

    return [...el.childNodes]
      .map(child => this.getTextFromElement(child as any))
      .filter(str => str.length > 0)
      .join('\n');
  }
}
