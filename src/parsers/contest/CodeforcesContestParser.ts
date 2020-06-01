import { Contest } from '../../models/Contest';
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

  /**
   * Parse a contest from the dashboard when problems are not available.
   *
   * For example: https://codeforces.com/gym/100524
   */
  private async parseFromContestPage(url: string, html: string): Promise<Contest> {
    const elem = htmlToElement(html);
    const linkSelector: string = '.problems > tbody > tr:not(:first-child)';
    const tasks = [...elem.querySelectorAll(linkSelector)].map((el: any) => {
      const task = new TaskBuilder('Codeforces');

      const td = el.querySelectorAll('td');

      task.setUrl(td[0].querySelector('a').href);

      const letter = td[0].querySelector('a').text.trim();
      const name = td[1].querySelector('a').text.trim();

      task.setGroup(
        'Codeforces - ' +
          document.querySelector('#sidebar > div > .rtable').querySelector('a').text.replace('\n', ' ').trim(),
      );

      task.setName(`${letter}. ${name}`);

      const data: string = td[1].querySelector('div > div:not(:first-child)').innerText;

      const match = /(.*)\/([^,]*)([0-9]+) s,([ 0-9]+) MB/.exec(data.replace('\n', ' '));

      const inputFile: string = match[1].trim();
      const outputFile: string = match[2].trim();
      const timeLimit: number = parseFloat(match[3].trim()) * 1000;
      const memoryLimit: number = parseFloat(match[4].trim());

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

  protected async parseLinks(links: string[], url: string, html: string): Promise<Contest> {
    // Try to parse contest using default parser.
    return await super.parseLinks(links, url, html).catch(async (reason: any) => {
      // If default parser failed it is probably because there are no page problem available.
      // This is the case from this contest for example: https://codeforces.com/gym/100524
      // Try to parse anyway the contest with available information.
      return await this.parseFromContestPage(url, html);
    });
  }
}
