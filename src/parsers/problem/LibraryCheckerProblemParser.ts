import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LibraryCheckerProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://judge.yosupo.jp/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Library Checker').setUrl(url);

    const container = elem.querySelector('.MuiContainer-root.MuiContainer-maxWidthLg > .MuiContainer-root');

    task.setName(container.querySelector('.MuiTypography-h2 + div').textContent);

    const timeLimitStr = container.querySelector('.MuiTypography-body1').textContent.trim();
    task.setTimeLimit(parseInt(/(\d+) sec/.exec(timeLimitStr)[1], 10) * 1000);

    task.setMemoryLimit(1024);

    const blocks = container.querySelectorAll('.uk-grid-small > div > pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
