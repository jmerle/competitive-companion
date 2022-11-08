import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HKoiJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://judge.hkoi.org/task/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('hkoi').setUrl(url);
    //task name
    const taskname = elem.querySelector('a.print-nolink').innerHTML;
    task.setName(taskname);
    const taskinfo = elem.querySelectorAll('div.task-info button');
    if (taskinfo != null && taskinfo.length == 4) {
      //time
      task.setTimeLimit(parseInt(taskinfo[1].innerHTML.toString().match('[0-9|.]+')[0]));
      //memory
      task.setMemoryLimit(parseInt(taskinfo[2].innerHTML.toString().match('[0-9|.]+')[0]));
    }

    const list = elem.querySelectorAll('.io');
    for (let i = 0; i < list.length; i += 2) {
      task.addTest(
        (<HTMLElement>list[i]).innerHTML.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' '),
        (<HTMLElement>list[i + 1]).innerHTML.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' '),
      );
    }
    return task.build();
  }
}
