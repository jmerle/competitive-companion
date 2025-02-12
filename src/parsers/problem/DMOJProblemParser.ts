import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class DMOJProblemParser extends Parser {
  public static DOMAINS = {
    'dmoj.ca': 'DMOJ',
    'arena.moi': 'MOI Arena',
    'lqdoj.edu.vn': 'Le Quy Don Online Judge',
    'oj.vnoi.info': 'VNOI Online Judge',
    'ayjcoding.club': 'A.Y. Jackson Online Judge',
  };

  public getMatchPatterns(): string[] {
    return Object.keys(DMOJProblemParser.DOMAINS).map(domain => `https://${domain}/problem/*`);
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const domain = Object.entries(DMOJProblemParser.DOMAINS).find(entry => url.startsWith(`https://${entry[0]}`));
    const judge = domain !== undefined ? domain[1] : 'DMOJ';

    const elem = htmlToElement(html);
    const task = new TaskBuilder(judge).setUrl(url);

    const titleParts = elem.querySelector('.problem-title h2').textContent.split(/ - | — |(?<=Contest \d+ [A-Z#]\d+) /);
    if (titleParts.length === 1) {
      task.setName(titleParts[0]);
    } else {
      let contestName = titleParts[0];
      let taskName = titleParts.slice(1).join(' - ');

      const problemMatches = /(Problem \d+|[A-Z#]\d+)$/.exec(contestName);
      if (problemMatches !== null) {
        contestName = contestName.substr(0, problemMatches.index).trim();
        taskName = `${problemMatches[0]} - ${taskName}`;
      }

      task.setName(taskName);
      task.setCategory(contestName);
    }

    const inputs: Element[] = [...elem.querySelectorAll('h4')].filter(el => {
      const text = el.textContent.toLowerCase();

      if (text.includes('output') || text.includes('explanation')) {
        return false;
      }

      return text.includes('sample input');
    });

    const outputs: Element[] = [...elem.querySelectorAll('h4')].filter(el => {
      const text = el.textContent.toLowerCase();

      if (text.includes('explanation')) {
        return false;
      }

      return text.includes('sample output') || text.includes('output for sample input');
    });

    inputs.push(...elem.querySelectorAll('.admonition.question > details:first-of-type > pre'));
    outputs.push(...elem.querySelectorAll('.admonition.question > details:last-of-type > pre'));

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      let inputElem: Element = inputs[i];
      while (inputElem.tagName !== 'PRE') {
        inputElem = inputElem.nextElementSibling;
      }

      let outputElem: Element = outputs[i];
      while (outputElem.tagName !== 'PRE') {
        outputElem = outputElem.nextElementSibling;
      }

      inputElem = inputElem.querySelector('code') || inputElem;
      outputElem = outputElem.querySelector('code') || outputElem;

      task.addTest(inputElem.textContent, outputElem.textContent);
    }

    const timeLimit = this.getProblemInfoValue(elem, '.fa-clock-o, .fa-clock');
    if (timeLimit !== null) {
      task.setTimeLimit(Math.floor(timeLimit * 1000));
    }

    const memoryLimit = this.getProblemInfoValue(elem, '.fa-server');
    if (memoryLimit !== null) {
      task.setMemoryLimit(Math.floor(memoryLimit));
    }

    return task.build();
  }

  private getProblemInfoValue(elem: Element, icons: string): number | null {
    const entryElem = [...elem.querySelectorAll('.problem-info-entry')].find(el => el.querySelector(icons) !== null);

    if (entryElem === undefined) {
      return null;
    }

    return parseFloat(entryElem.textContent.split('\n')[2].slice(0, -1));
  }
}
