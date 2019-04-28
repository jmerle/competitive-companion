import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class GoogleCodingCompetitionsProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://codingcompetitions.withgoogle.com/codejam/round/*/*',
      'https://codingcompetitions.withgoogle.com/kickstart/round/*/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    task.setName(elem.querySelector('#problem-select-selected-text').textContent.split(' (')[0]);
    task.setGroup(elem.querySelector('.competition-nav p.headline-5').textContent);

    const container = elem.querySelector('.problem-description');

    const interactiveText = html.includes('This problem is interactive');
    const interactiveHeader = [...container.querySelectorAll('h3')].some(
      el => (el as any).textContent === 'Sample interaction',
    );

    task.setInteractive(interactiveText || interactiveHeader);

    const blocks = container.querySelectorAll('.problem-io-wrapper pre.io-content');
    if (blocks.length !== 0) {
      const input = blocks[0].textContent.trim();
      const output = blocks[1].textContent.trim();

      task.addTest(input, output);
    }

    try {
      task.setTimeLimit(parseFloat(/Time limit: ([0-9.]+) second/.exec(container.textContent)[1]) * 1000);
    } catch (err) {
      task.setTimeLimit(30000);
    }

    try {
      task.setMemoryLimit(parseInt(/Memory limit: (\d+)GB/.exec(container.textContent)[1], 10) * 1024);
    } catch (err) {
      task.setMemoryLimit(1024);
    }

    task.setJavaMainClass('Solution');
    task.setTestType(TestType.MultiNumber);

    return task.build();
  }
}
