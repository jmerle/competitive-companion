import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { toLatin } from '../../utils/tolatin';
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

    task.setName(toLatin(elem.querySelector('.pagetitle').textContent));

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

    if (elem.querySelector('.taskContentView tbody')) {
      elem.querySelector('.taskContentView tbody').childNodes.forEach(x => {
        const parsed = /^(?:input|влез)\n(.*)(?:output|излез)\n(.*)$/s.exec(x.textContent);
        task.addTest(parsed[1] + '\n', parsed[2] + '\n');
      });
    } else {
      // As of now there isn't a better discovered way of checking if it's interactive :rofl:
      task.setInteractive(true);
    }

    return task.build();
  }
}
