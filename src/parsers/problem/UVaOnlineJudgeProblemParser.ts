import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { readPdf } from '../../utils/pdf';
import { Parser } from '../Parser';

export class UVaOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://uva.onlinejudge.org/index.php*', 'https://icpcarchive.ecs.baylor.edu/index.php*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /https:\/\/uva\.onlinejudge\.org\/index\.php\?(.*)page=show_problem(.*)problem=(\d+)(.*)/,
      /https:\/\/icpcarchive\.ecs\.baylor\.edu\/index\.php\?(.*)page=show_problem(.*)problem=(\d+)(.*)/,
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(async resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const container = elem.querySelector('#col3_content_wrapper, td.main');
      const isUVa = !container.classList.contains('main');

      const header = container.querySelector('h3');
      const iframe = container.querySelector('iframe');

      task.setName(header.textContent);
      task.setGroup(isUVa ? 'UVa Online Judge' : 'ICPC Live Archive');

      task.setTimeLimit(parseFloat(/Time limit: ([0-9.]+) seconds/.exec(header.nextSibling.textContent)[1]) * 1000);
      task.setMemoryLimit(32);

      try {
        const iframeUrl = (iframe as HTMLIFrameElement).src;

        const firstPart = /(.*)\//.exec(iframeUrl)[1];
        const secondPart = /(?:.*)\/(.*)\.html/.exec(iframeUrl)[1];
        const pdfUrl = firstPart + '/p' + secondPart + '.pdf';

        const lines = await readPdf(pdfUrl);

        task.setInteractive(
          lines.some(
            line => line.toLowerCase() === 'interaction protocol' || line.toLowerCase() === 'sample interaction',
          ),
        );

        const inputStart = lines.findIndex(line => line.toLowerCase() === 'sample input');
        const outputStart = lines.findIndex(line => line.toLowerCase() === 'sample output');

        if (inputStart !== -1 && outputStart !== -1) {
          const input = lines.slice(inputStart + 1, outputStart).join('\n');
          const output = lines.slice(outputStart + 1).join('\n');

          task.addTest(input, output);
        }
      } catch (err) {}

      resolve(task.build());
    });
  }
}
