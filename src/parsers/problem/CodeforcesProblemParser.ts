import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { decodeHtml, htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

export class CodeforcesProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns: string[] = [];

    [
      'https://codeforces.com/contest/*/problem/*',
      'https://codeforces.com/problemset/problem/*/*',
      'https://codeforces.com/gym/*/problem/*',
      'https://codeforces.com/group/*/contest/*/problem/*',
      'https://codeforces.com/problemsets/acmsguru/problem/*/*',
      'https://codeforces.com/edu/course/*/lesson/*/*/practice/contest/*/problem/*',
      'https://codeforces.com/problemset/gymProblem/*',
    ].forEach(pattern => {
      patterns.push(pattern);
      patterns.push(pattern.replace('https://codeforces.com', 'https://*.codeforces.com'));
    });

    const mlPatterns = patterns.map(pattern => pattern.replace('.com', '.ml'));
    const esPatterns = patterns.map(pattern => pattern.replace('es.com', '.es'));
    const netPatterns = patterns.map(pattern => pattern.replace('.com', '.net'));

    const httpsPatterns = [...patterns, ...mlPatterns, ...esPatterns, ...netPatterns];
    const httpPatterns = httpsPatterns.map(pattern => pattern.replace('https://', 'http://'));

    return [...httpsPatterns, ...httpPatterns];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const task = new TaskBuilder('Codeforces').setUrl(url);

    if (url.includes('/problemsets/acmsguru')) {
      const elem = htmlToElement(html);
      const table = elem.querySelector('.problemindexholder > .ttypography > table');

      if (table) {
        this.parseAcmSguRuProblemInsideTable(html, task);
      } else {
        this.parseAcmSguRuProblemNotInsideTable(html, task);
      }
    } else if (html.startsWith('%PDF') || htmlToElement(html).querySelector('embed[type="application/pdf"]') !== null) {
      await this.parsePdfProblem(url, task);
    } else {
      this.parseMainProblem(html, url, task);
    }

    return task.build();
  }

  private parseMainProblem(html: string, url: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problem-statement > .header > .title').textContent.trim());

    if (url.includes('/edu/')) {
      const breadcrumbs = [...elem.querySelectorAll('.eduBreadcrumb > a')].map(el => el.textContent.trim());
      breadcrumbs.pop();
      task.setCategory(breadcrumbs.join(' - '));
    } else {
      const contestType = url.includes('/gym/') ? 'gym' : 'contest';
      const titleElem = elem.querySelector(`.rtable > tbody > tr > th > a[href*=${contestType}]`);

      if (titleElem !== null) {
        task.setCategory(titleElem.textContent.trim());
      }
    }

    const interactiveKeywords = ['Interaction', 'Протокол взаимодействия'];
    const isInteractive = [...elem.querySelectorAll('.section-title')].some(
      el => interactiveKeywords.indexOf(el.textContent) > -1,
    );

    task.setInteractive(isInteractive);

    const timeLimitNode = this.getLastTextNode(elem, '.problem-statement > .header > .time-limit');
    const timeLimitStr = timeLimitNode.textContent.split(' ')[0];
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitNode = this.getLastTextNode(elem, '.problem-statement > .header > .memory-limit');
    const memoryLimitStr = memoryLimitNode.textContent.split(' ')[0];
    task.setMemoryLimit(parseInt(memoryLimitStr, 10));

    const inputFile = this.getLastTextNode(elem, '.problem-statement > .header > .input-file').textContent;
    if (inputFile !== 'stdin' && inputFile !== 'standard input' && inputFile !== 'стандартный ввод') {
      task.setInput({
        fileName: inputFile,
        type: 'file',
      });
    }

    const outputFile = this.getLastTextNode(elem, '.problem-statement > .header > .output-file').textContent;
    if (outputFile !== 'stdout' && outputFile !== 'standard output' && outputFile !== 'стандартный вывод') {
      task.setOutput({
        fileName: outputFile,
        type: 'file',
      });
    }

    const inputs = elem.querySelectorAll('.input pre');
    const outputs = elem.querySelectorAll('.output pre');

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(this.parseMainTestBlock(inputs[i]), this.parseMainTestBlock(outputs[i]));
    }
  }

  private parseMainTestBlock(block: Element): string {
    const lines = [...block.querySelectorAll('.test-example-line')];

    if (lines.length === 0) {
      return decodeHtml(block.innerHTML);
    }

    return [...lines].map(el => (el.querySelector('br') === null ? decodeHtml(el.innerHTML) : '')).join('\n');
  }

  private parseAcmSguRuProblemInsideTable(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problemindexholder h3').textContent.trim());
    task.setCategory('acm.sgu.ru archive');

    task.setTimeLimit(parseFloat(/time limit per test: ([0-9.]+)\s+sec/.exec(html)[1]) * 1000);
    task.setMemoryLimit(parseInt(/memory\s+limit per test:\s+(\d+)\s+KB/.exec(html)[1], 10) / 1000);

    const blocks = elem.querySelectorAll('font > pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }
  }

  private parseAcmSguRuProblemNotInsideTable(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problemindexholder h4').textContent.trim());
    task.setCategory('acm.sgu.ru archive');

    task.setTimeLimit(parseFloat(/Time\s+limit per test: ([0-9.]+)\s+sec/i.exec(html)[1]) * 1000);
    task.setMemoryLimit(parseInt(/Memory\s+limit(?: per test)*: (\d+)\s+(?:kilobytes|KB)/i.exec(html)[1], 10) / 1000);

    elem.querySelectorAll('table').forEach(table => {
      const blocks = table.querySelectorAll('pre');
      if (blocks.length === 4) {
        task.addTest(blocks[2].textContent, blocks[3].textContent);
      }
    });
  }

  private async parsePdfProblem(url: string, task: TaskBuilder): Promise<void> {
    const parsedUrl = new URL(url);
    const contest = await request(parsedUrl.origin + parsedUrl.pathname.split('/problem')[0]);

    const elem = htmlToElement(contest);

    const contestName = elem
      .querySelector('#sidebar > div > .rtable')
      .querySelector('a')
      .textContent.replace('\n', ' ')
      .trim();

    task.setCategory(contestName);

    const letter = url[url.length - 1].toUpperCase();
    const rowElem = [...elem.querySelectorAll('table.problems > tbody > tr')].find(el => {
      const link = el.querySelector('.id > a');
      return link !== null && link.textContent.trim() === letter;
    });

    this.parseContestRow(rowElem, task);
  }

  public parseContestRow(elem: Element, task: TaskBuilder): void {
    const columns = elem.querySelectorAll('td');

    task.setUrl(columns[0].querySelector('a').href);

    const letter = columns[0].querySelector('a').text.trim();
    const name = columns[1].querySelector('a').text.trim();

    task.setName(`${letter}. ${name}`);

    const detailsStr = columns[1].querySelector('div > div:not(:first-child)').textContent;
    const detailsMatches = /([^/]+)\/([^\n]+)\s+([0-9.]+) s,\s+(\d+) MB/.exec(detailsStr.replace('\n', ' '));

    const inputFile = detailsMatches[1].trim();
    const outputFile = detailsMatches[2].trim();
    const timeLimit = Math.floor(parseFloat(detailsMatches[3].trim()) * 1000);
    const memoryLimit = parseInt(detailsMatches[4].trim());

    if (inputFile.includes('.')) {
      task.setInput({
        fileName: inputFile,
        type: 'file',
      });
    }

    if (outputFile.includes('.')) {
      task.setOutput({
        fileName: outputFile,
        type: 'file',
      });
    }

    task.setTimeLimit(timeLimit);
    task.setMemoryLimit(memoryLimit);
  }

  private getLastTextNode(elem: Element, selector: string): ChildNode {
    let selectedNode = elem.querySelector(selector);

    const styledNode = selectedNode.querySelector('.tex-font-style-sl, .tex-font-style-bf');
    if (styledNode !== null) {
      selectedNode = styledNode;
    }

    const textNodes = [...selectedNode.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
    return textNodes[textNodes.length - 1];
  }
}
