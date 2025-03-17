import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class MendoProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://mendo.mk/Task.do?id=*'];
  }
  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/(?:www\.)?mendo\.mk\/Task\.do\?id=\d+$/];
  }
  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Mendo').setUrl(url);

    await task.setName(elem.querySelector('.pagetitle').textContent);

    elem.querySelectorAll('.taskContentView > h3').forEach(x => {
      const text = x.textContent.trim();
      if (text !== 'Ограничувања' && text !== 'Constraints') {
        return;
      }

      const results =
        /(Временско ограничување|Time limit): (\d+) ([а-ш]+|[a-z]+)(Мемориско ограничување|Memory limit): (\d+) ([а-шј]+|[a-z]+)/.exec(
          x.nextElementSibling.textContent,
        );

      let time = parseInt(results[2]);
      const timeUnit = results[3].slice(0, 6);
      if (timeUnit === 'секунд' || timeUnit === 'second') {
        time *= 1000;
      }

      task.setTimeLimit(time);
      task.setMemoryLimit(parseInt(results[5]));
    });

    const sampleCasePattern = /^(?:input|влез)\n(.*)(?:output|излез)\n(.*)$/s;
    for (const tbody of elem.querySelectorAll('.taskContentView tbody')) {
      if ([...tbody.childNodes].some(child => !sampleCasePattern.test(child.textContent))) {
        continue;
      }

      for (const child of tbody.childNodes) {
        const parsed = sampleCasePattern.exec(child.textContent);
        task.addTest(parsed[1] + '\n', parsed[2] + '\n');
      }
    }

    // As of now there isn't a better discovered way of checking if it's interactive :rofl:
    task.setInteractive(task.tests.length === 0);

    return task.build();
  }
}
