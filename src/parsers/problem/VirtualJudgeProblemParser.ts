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

    // --- Title ---
    // Old UI had #problem-title (standalone problem page) or #prob-title > h2 (contest page).
    // New UI renders a plain <h2> in the problem content area on contest pages;
    // standalone /problem/* pages still use h2#problem-title.
    if (elem.querySelector('h2#problem-title') !== null) {
      task.setName(elem.querySelector('h2#problem-title').textContent.trim());
    } else {
      // New contest UI: first <h2> inside the main problem content panel.
      const h2 = elem.querySelector<HTMLElement>('.prob-main h2, #prob-main h2, h2');
      task.setName(h2 ? h2.textContent.trim() : '');
    }

    // --- Category ---
    // Old UI: #time-info > .row > .col-xs-6 > h3 (now gone from contests).
    // New UI: a plain <h3> directly inside #time-info (contest title area).
    // Standalone /problem/* pages: derive from URL as before.
    if (url.includes('/contest/')) {
      const catEl =
        elem.querySelector<HTMLElement>('#time-info h3') ??
        elem.querySelector<HTMLElement>('h3');
      task.setCategory(catEl ? catEl.textContent.trim() : 'Virtual Judge');
    } else {
      // Standalone problem page: category is the OJ prefix, e.g. "CodeForces" from "CodeForces-1A".
      task.setCategory(window.location.href.split('/').pop().split('-')[0]);
    }

    // --- Time / Memory limits ---
    // The <dt> labels have stayed; however the sibling is now a plain <div class="value">
    // instead of a <dd> in the new sidebar layout. We handle both via nextElementSibling.
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

    // --- Sample tests ---
    try {
      if (url.includes('UVA-') || url.includes('UVALive-')) {
        // UVa problems are delivered as PDFs.
        // Old UI: embedded via an iframe whose src pointed to a CDN PDF.
        // New UI: a direct PDF link with id="btn-contest-problem-pdf" or similar.
        const pdfBtn = elem.querySelector<HTMLAnchorElement>(
          '#btn-contest-problem-pdf, a[href*="problemPdf"], a[href$=".pdf"]',
        );

        if (pdfBtn !== null) {
          const pdfContent = await request(pdfBtn.href);
          const pdfId = /CDN_BASE_URL\/([^?]+)\?v/.exec(pdfContent)?.[1];
          if (pdfId) {
            const pdfLines = await readPdf(`https://vj.csgrandeur.cn/${pdfId}`);
            const uvaParser = new UVaOnlineJudgeProblemParser();
            await uvaParser.parseTestsFromPdf(task, pdfLines);
          }
        } else {
          // Fallback to old iframe approach in case the old UI is encountered.
          const iframe = [...elem.querySelectorAll<HTMLIFrameElement>('#prob-right-panel iframe')].find(
            el => el.style.display !== 'none',
          );
          if (iframe !== undefined) {
            const iframeContent = await request(iframe.src);
            const pdfId = /CDN_BASE_URL\/([^?]+)\?v/.exec(iframeContent)[1];
            const pdfLines = await readPdf(`https://vj.csgrandeur.cn/${pdfId}`);
            const uvaParser = new UVaOnlineJudgeProblemParser();
            await uvaParser.parseTestsFromPdf(task, pdfLines);
          }
        }
      } else if (!url.includes('TopCoder-')) {
        // New UI: the descKey is embedded in the PDF download button href as
        // `/contest/{id}/problemPdf/{letter}?descKey={key}`.
        // Standalone problem pages use a different button.
        const descKey = this.extractDescKey(elem);

        if (descKey !== null) {
          const descriptionUrl = `https://vjudge.net/problem/description/${descKey}`;
          const description = await request(descriptionUrl, { credentials: 'same-origin' });
          const jsonContainer = htmlToElement(description).querySelector('.data-json-container');
          if (jsonContainer !== null) {
            const json = JSON.parse(jsonContainer.textContent);
            const codeBlocks = this.getCodeBlocksFromDescription(json);
            for (let i = 0; i < codeBlocks.length - 1; i += 2) {
              task.addTest(codeBlocks[i], codeBlocks[i + 1]);
            }
          }
        } else {
          // Fallback: try the old iframe-based approach (old UI compatibility).
          const iframe = [...elem.querySelectorAll<HTMLIFrameElement>('#prob-right-panel iframe')].find(
            el => el.style.display !== 'none',
          );

          if (iframe !== undefined) {
            const iframeUrl = iframe.src;
            const iframeContent = await request(iframeUrl);
            const jsonContainer = htmlToElement(iframeContent).querySelector('.data-json-container');
            const json = JSON.parse(jsonContainer.textContent);

            const codeBlocks = this.getCodeBlocksFromDescription(json);
            for (let i = 0; i < codeBlocks.length - 1; i += 2) {
              task.addTest(codeBlocks[i], codeBlocks[i + 1]);
            }
          }
        }
      }
    } catch (err) {
      // Do nothing
    }

    return task.build();
  }

  /**
   * Extracts the description key from the page.
   *
   * New UI: the key is in the PDF download button href, e.g.
   *   /contest/802878/problemPdf/A?descKey=2672272863153537
   *
   * Returns null when no such link is found (old UI fallback).
   */
  private extractDescKey(elem: Element): string | null {
    // Contest problem page: PDF button with id or href pattern.
    const pdfLink = elem.querySelector<HTMLAnchorElement>(
      '#btn-contest-problem-pdf, a[href*="problemPdf"][href*="descKey"]',
    );
    if (pdfLink !== null) {
      try {
        return new URL(pdfLink.href, 'https://vjudge.net').searchParams.get('descKey');
      } catch {
        // href may be relative or malformed; fall through.
      }
    }

    // Standalone /problem/* page: look for a similar link with descKey.
    const descLinks = [...elem.querySelectorAll<HTMLAnchorElement>('a[href*="descKey"]')];
    for (const link of descLinks) {
      try {
        const key = new URL(link.href, 'https://vjudge.net').searchParams.get('descKey');
        if (key) return key;
      } catch {
        // continue
      }
    }

    return null;
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
