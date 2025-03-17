import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NBUTOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://ac.2333.moe/Problem/view.xhtml*', 'https://ac.2333.moe/Contest/view/id/*/problem/*.xhtml'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('NBUT Online Judge').setUrl(url);

    await task.setName(elem.querySelector('#title > h3').textContent);

    const limitsStr = elem.querySelector('#limit').textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(limitsStr)[1]));
    task.setMemoryLimit(Math.round(parseInt(/(\d+) K/.exec(limitsStr)[1]) / 1024));

    const sampleInput = elem.querySelector('#sampleinput > pre');
    const sampleOutput = elem.querySelector('#sampleoutput > pre');
    if (sampleInput !== null && sampleOutput !== null) {
      task.addTest(sampleInput.textContent, sampleOutput.textContent);
    }

    return task.build();
  }
}
