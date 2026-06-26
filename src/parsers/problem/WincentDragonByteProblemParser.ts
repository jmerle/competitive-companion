import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class WincentDragonByteProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://wincentdragonbyte.com/problem/*', 'https://wincentdragonbyte.com/static/*/*_statement.html'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Wincent DragonByte').setUrl(url);

    const liveMatch = /\/problem\/([^/?#]+)/.exec(url);
    const archiveMatch = /\/static\/([^/]+)\/([^_/]+)_statement\.html/.exec(url);
    const letter = liveMatch !== null ? liveMatch[1] : archiveMatch !== null ? archiveMatch[2] : '';

    const heading = elem.querySelector('#problem_statement h1, h1');
    const baseName = heading !== null ? heading.textContent.replace(/\s+/g, ' ').trim() : '';
    task.setName(letter.length > 0 ? `${letter}: ${baseName}` : baseName);

    const roundSlug = archiveMatch !== null ? archiveMatch[1] : this.detectRoundFromPage(elem);
    if (roundSlug.length > 0) {
      task.setCategory(formatRound(roundSlug));
    }

    for (const table of elem.querySelectorAll('table.io')) {
      const cells = table.querySelectorAll('tr > td');
      if (cells.length < 2) {
        continue;
      }
      const input = cells[0].querySelector('pre');
      const output = cells[1].querySelector('pre');
      if (input === null || output === null) {
        continue;
      }
      task.addTest(input.textContent, output.textContent);
    }

    task.setTestType(TestType.MultiNumber);

    // Wincent DragonByte is solved offline: contestants download per-subproblem
    // input files and submit per-subproblem output files, so the page does not
    // advertise judge-side time or memory limits. Use generous defaults to match
    // the local-execution context.
    task.setTimeLimit(60000);
    task.setMemoryLimit(1024);

    return task.build();
  }

  private detectRoundFromPage(elem: Element): string {
    const link = elem.querySelector('a[href*="/static/"]');
    if (link === null) {
      return '';
    }
    const href = (link as HTMLAnchorElement).getAttribute('href') || '';
    const match = /\/static\/([^/]+)\//.exec(href);
    return match !== null ? match[1] : '';
  }
}

function formatRound(slug: string): string {
  const match = /^([a-z]+)(\d{4})$/i.exec(slug);
  if (match === null) {
    return slug;
  }
  const type = match[1].toLowerCase();
  const year = match[2];
  const labels: Record<string, string> = {
    qual: 'Qualification',
    quals: 'Qualifications',
    qualifier: 'Qualifier',
    qualification: 'Qualification',
    final: 'Final',
    finals: 'Finals',
    semifinal: 'Semifinal',
    semifinals: 'Semifinals',
    round: 'Round',
    practice: 'Practice',
  };
  const label = labels[type] !== undefined ? labels[type] : type.charAt(0).toUpperCase() + type.slice(1);
  return `${label} ${year}`;
}
