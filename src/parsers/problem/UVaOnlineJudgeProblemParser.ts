import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { readPdf } from '../../utils/pdf';
import { Parser } from '../Parser';

export class UVaOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://onlinejudge.org/index.php*',
      'https://icpcarchive.ecs.baylor.edu/index.php*',
      'https://onlinejudge.org/external/*/*.pdf',
      'https://icpcarchive.ecs.baylor.edu/external/*/*.pdf',
    ];
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /https:\/\/onlinejudge\.org\/index\.php\?(.*)page=show_problem(.*)problem=(\d+)(.*)/,
      /https:\/\/icpcarchive\.ecs\.baylor\.edu\/index\.php\?(.*)page=show_problem(.*)problem=(\d+)(.*)/,
      /https:\/\/onlinejudge\.org\/external\/(.*)\.pdf/,
      /https:\/\/icpcarchive\.ecs\.baylor\.edu\/external\/(.*)\.pdf/,
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const isUVa = url.includes('onlinejudge.org');
    const task = new TaskBuilder(isUVa ? 'UVa Online Judge' : 'ICPC Live Archive').setUrl(url);

    if (url.endsWith('.pdf')) {
      await this.parseFromPdf(task, url);
    } else {
      await this.parseFromHtml(task, html);
    }

    return task.build();
  }

  private async parseFromHtml(task: TaskBuilder, html: string): Promise<void> {
    const elem = htmlToElement(html);
    const container = elem.querySelector('#col3_content_wrapper, td.main');

    const header = container.querySelector('h3');
    await task.setName(header.textContent);

    task.setTimeLimit(parseFloat(/Time limit: ([0-9.]+) seconds/.exec(header.nextSibling.textContent)[1]) * 1000);
    task.setMemoryLimit(32);

    const iframe = container.querySelector('iframe');
    const iframeUrl = iframe.src;

    const firstPart = /(.*)\//.exec(iframeUrl)[1];
    const secondPart = /(?:.*)\/(.*)\.html/.exec(iframeUrl)[1];
    const pdfUrl = firstPart + '/p' + secondPart + '.pdf';

    const lines = await readPdf(pdfUrl);

    await this.parseTestsFromPdf(task, lines);
  }

  private async parseFromPdf(task: TaskBuilder, pdfUrl: string): Promise<void> {
    const lines = await readPdf(pdfUrl);

    const problemName = lines[1][0] === '\\' ? '"' + lines[1].substr(1) : lines[1];
    await task.setName(`${lines[0]} - ${problemName}`);

    await this.parseTestsFromPdf(task, lines);
  }

  public async parseTestsFromPdf(task: TaskBuilder, lines: string[]): Promise<void> {
    const interactiveKeywords = ['interaction protocol', 'sample interaction'];
    task.setInteractive(lines.some(line => interactiveKeywords.indexOf(line.toLowerCase()) > -1));

    const inputStart = lines.findIndex(line => line.toLowerCase() === 'sample input');
    const outputStart = lines.findIndex(line => line.toLowerCase() === 'sample output');

    if (inputStart !== -1 && outputStart !== -1) {
      let inputLines = lines.slice(inputStart + 1, outputStart);

      if (/(\d+)\/(\d+)/.test(inputLines[inputLines.length - 1])) {
        inputLines = inputLines.slice(0, inputLines.length - 3);
      }

      task.addTest(inputLines.join('\n'), lines.slice(outputStart + 1).join('\n'));
    }
  }
}
