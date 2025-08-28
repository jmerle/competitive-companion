import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class OlinfoProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://training.olinfo.it/task/*', 'https://training.olinfo.it/task/terry/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/training\.olinfo\.it\/task\/(?:terry\/)?[\w-]+$/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Olinfo').setUrl(url);

    task.setName(elem.querySelector('header h1').textContent);

    if (/\/terry\/\w+$/.test(url)) {
      // Special task format for regionals
      let input = '';
      elem.querySelectorAll('main>div>p').forEach(e => {
        let f = e.querySelector('strong')?.textContent;
        if (typeof f !== 'string') return;
        f = f.trim();
        if (f === 'Input:') {
          input = e.nextElementSibling.textContent;
        } else if (f === 'Output:') {
          task.addTest(input, e.nextElementSibling.textContent);
        }
      });
      // Turns out they don't have a time/memory limit on the regionals because the program is only running on the
      // competitors' computers... the website gives an input and you have 10 minutes to upload the output (and the source??)
      // Still, the tasks are batch format and are applicable for this
      return task.build();
    }

    for (const c of elem.querySelector('header>.grid').children) {
      const d = c.childNodes[c.childNodes.length - 1].textContent;
      if (['Limite di tempo:', 'Time limit:'].includes(c.querySelector('span').textContent.trim())) {
        task.setTimeLimit(parseFloat(/(\d+)/.exec(d)[1]) * 1e3);
      } else if (['Limite di memoria:', 'Memory limit:'].includes(c.querySelector('span').textContent.trim())) {
        task.setMemoryLimit(parseFloat(/(\d+)/.exec(d)[1]));
      }
    }

    const tests: [string, string][] = [];
    for (const a of elem.querySelectorAll('aside ul.menu a') as NodeListOf<HTMLAnchorElement>) {
      const name = a.textContent;
      if (/input\d+.txt$/.test(name)) {
        const i = parseInt(/(\d+)/.exec(name)[1]);
        while (tests.length <= i) tests.push(['', '']);
        tests[i][0] = await fetch(a.href).then(x => x.text());
      } else if (/output\d+.txt$/.test(name)) {
        const i = parseInt(/(\d+)/.exec(name)[1]);
        while (tests.length <= i) tests.push(['', '']);
        tests[i][1] = await fetch(a.href).then(x => x.text());
      }
    }
    tests.forEach(x => task.addTest(...x));

    return task.build();
  }
}
