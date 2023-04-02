import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NepsAcademyProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://neps.academy/exercise/*',
      'https://neps.academy/course/*/lesson/*',
      'https://neps.academy/competition/*/exercise/*',
      'https://neps.academy/br/exercise/*',
      'https://neps.academy/br/course/*/lesson/*',
      'https://neps.academy/br/competition/*/exercise/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Neps Academy').setUrl(url);

    task.setName(elem.querySelector('.grid-item-main .v-card h1').textContent);

    const blocks = elem.querySelectorAll('.exercise-table .table-column > div');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent.trimStart(), blocks[i + 1].textContent.trimStart());
    }

    const limitsStr = elem.querySelector('.exercise-submission-card > .v-card').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+) second/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) mb/.exec(limitsStr)[1], 10));

    return task.build();
  }
}
