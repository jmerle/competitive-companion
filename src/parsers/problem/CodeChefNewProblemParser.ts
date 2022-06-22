import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeChefNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.codechef.com/submit/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CodeChef').setUrl(url);

    task.setName(elem.querySelector('div[class^="TopBanner_problem__title__"] > span').textContent);

    const contestLink = elem.querySelector('a[class^="TopBanner_contest__link__"]');
    if (contestLink !== null) {
      task.setCategory(contestLink.childNodes[0].textContent.trim());
    } else {
      task.setCategory('Practice');
    }

    task.setInteractive(html.includes('This is an interactive problem'));

    elem.querySelectorAll('div[class^="MarkdownPreview_input_output__table__"]').forEach(table => {
      const blocks = table.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });

    if (task.tests.length === 0) {
      const blocks = [...elem.querySelectorAll('pre')];
      for (let i = 0; i < blocks.length - 1; i += 2) {
        task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
      }
    }

    const timeLimitStr = elem.querySelector('div[class^="ProblemStatementView_more-info__container__"]').textContent;
    task.setTimeLimit(Math.floor(parseFloat(/([0-9.]+) secs/.exec(timeLimitStr)[1]) * 1000));

    task.setMemoryLimit(256);

    return task.build();
  }
}
