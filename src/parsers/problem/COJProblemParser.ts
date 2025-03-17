import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class COJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://coj.uci.cu/24h/problem.xhtml*', 'https://coj.uci.cu/contest/cproblem.xhtml*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('COJ').setUrl(url);

    const content = elem.querySelector('.postcontent');

    await task.setName(content.querySelector('h3.text-center > b').textContent.split('- ')[1]);

    const contestTitleElem = elem.querySelector('h2.postheader > a.linkheader');
    if (contestTitleElem !== null) {
      task.setCategory(contestTitleElem.textContent);
    }

    const limitsStr = content.querySelector('.limit.lang2').textContent;

    // There exist two limits in COJ for solutions to run.
    // [Test Time] Maximum time allowed per test case.
    // [Total Time] Maximum time allowed for all test cases. (Sum of individual test case runs).
    //
    // Use [Test Time] when it exists. (For some problems it is not defined).
    // Use [Total Time] when [Test Time] is not defined.

    const totalTime = /Total Time:[\n ]*(\d+) MS/.exec(limitsStr);
    const testTime = /Test Time:[\n ]*(\d+) MS/.exec(limitsStr);
    const memory = /Memory:[\n ]*(\d+) MB/.exec(limitsStr);

    const timeLimit = testTime !== null ? parseInt(testTime[1], 10) : parseInt(totalTime[1], 10);
    const memoryLimit = parseInt(memory[1], 10);

    task.setTimeLimit(timeLimit);
    task.setMemoryLimit(memoryLimit);

    const inputs = [...elem.querySelectorAll('h4.text-primary')]
      .filter(el => el.textContent.trim().startsWith('Sample input'))
      .map(el => el.nextElementSibling);

    const outputs = [...elem.querySelectorAll('h4.text-primary')]
      .filter(el => el.textContent.trim().startsWith('Sample output'))
      .map(el => el.nextElementSibling);

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i].innerHTML, outputs[i].innerHTML);
    }

    return task.build();
  }
}
