import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { CodeforcesProblemParser } from '../problem/CodeforcesProblemParser';

export class CodeforcesContestParser extends ContestParser {
  public problemParser: Parser = new CodeforcesProblemParser();
  public linkSelector: string = '.problems > tbody > tr > td:first-child > a';

  public getMatchPatterns(): string[] {
    const patterns: string[] = [];

    [
      'https://codeforces.com/contest/*',
      'https://codeforces.com/gym/*',
      'https://codeforces.com/group/*/contest/*',
      'https://codeforces.com/edu/course/*/lesson/*/*/practice',
    ].forEach(pattern => {
      patterns.push(pattern);
      patterns.push(pattern.replace('https://codeforces.com', 'https://*.codeforces.com'));
    });

    const mlPatterns = patterns.map(pattern => pattern.replace('.com', '.ml'));
    const esPatterns = patterns.map(pattern => pattern.replace('codeforces.com', 'codeforc.es'));

    return patterns.concat(mlPatterns).concat(esPatterns);
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /^https?:\/\/codeforces[.]com\/(group\/[a-zA-Z0-9]+\/)?(contest|gym)\/(\d+)(\?.*)?$/,
      /^https?:\/\/codeforces[.]com\/edu\/course\/\d+\/lesson\/\d+\/\d+\/practice(\?.*)?$/,
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    // Some contests provide the problem statements inside a PDF file.
    // These cannot be parsed with the regular CodeforcesProblemParser.
    //
    // We try to detect whether the contest provides problems in a PDF by
    // fetching the first URL and checking whether it redirects to a /attachments url.
    //
    // Example contest which uses a PDF for problem statements: https://codeforces.com/gym/100524

    const elem = htmlToElement(html);

    const firstLink = (elem.querySelector(this.linkSelector) as HTMLLinkElement).href;
    const firstLinkResponse = await fetch(firstLink, { redirect: 'follow' });

    if (firstLinkResponse.url.endsWith('/attachments')) {
      return this.parseFromContestPage(url, html);
    } else {
      return super.parse(url, html);
    }
  }

  private async parseFromContestPage(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    const contestName = elem
      .querySelector('#sidebar > div > .rtable')
      .querySelector('a')
      .textContent.replace('\n', ' ')
      .trim();

    const rowSelector = '.problems > tbody > tr:not(:first-child)';
    const tasks = [...elem.querySelectorAll(rowSelector)].map(row => {
      const task = new TaskBuilder('Codeforces').setCategory(contestName);

      const columns = row.querySelectorAll('td');

      task.setUrl(columns[0].querySelector('a').href);

      const letter = columns[0].querySelector('a').text.trim();
      const name = columns[1].querySelector('a').text.trim();

      task.setName(`${letter}. ${name}`);

      const detailsStr = columns[1].querySelector('div > div:not(:first-child)').textContent;
      const detailsMatches = /([^/]+)\/([^\n]+)\s+(\d+) s,\s+(\d+) MB/.exec(detailsStr.replace('\n', ' '));

      const inputFile = detailsMatches[1].trim();
      const outputFile = detailsMatches[2].trim();
      const timeLimit = parseInt(detailsMatches[3].trim()) * 1000;
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

      return task.build();
    });

    return new Contest(tasks);
  }
}
