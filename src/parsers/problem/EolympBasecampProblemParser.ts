import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

interface FlightData {
  rows: any[];
  texts: Record<string, string>;
}

export class EolympBasecampProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://eolymp.com/problems/*', 'https://eolymp.com/compete/*/problems/*'];
  }

  public async parse(url: string): Promise<Sendable> {
    // The site is a single-page app that lazy-loads the examples, so the DOM is not a reliable source
    // The data embedded in the current document goes stale after client-side navigation, so the page is requested again
    return this.parseHtml(url, await request(url));
  }

  public async parseHtml(url: string, html: string): Promise<Task> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Eolymp').setUrl(url);

    const flightData = this.getFlightData(elem);
    const problem = this.findProblem(flightData.rows);
    if (problem === null) {
      throw new Error('Problem data not found, make sure you are signed in if the problem requires it');
    }

    const resolve = (value: string): string => this.resolveString(value, flightData.texts);
    const rows: any[] = problem.content.render.children;

    const heading = rows.find(row => row.type === 'heading');
    const headingText = (heading?.children ?? []).map((child: any) => resolve(child.attr?.text ?? '')).join('');
    task.setName(problem.title ? resolve(problem.title) : headingText);

    const pageTitle = (elem.querySelector('title')?.textContent ?? '').replace(/ — Basecamp$/, '').trim();
    if (url.includes('/compete/') && pageTitle && pageTitle !== task.name && pageTitle !== 'Basecamp') {
      task.setCategory(`Basecamp - ${pageTitle}`);
    } else {
      task.setCategory('Basecamp');
    }

    for (const row of rows) {
      if (row.type === 'problem-constraints') {
        const timeLimit =
          parseInt(row.attr['cpu-limit-max'] || '0', 10) || parseInt(row.attr['time-limit-max'] || '0', 10);
        if (timeLimit > 0) {
          task.setTimeLimit(timeLimit);
        }

        const memoryLimit = parseInt(row.attr['memory-limit-max'] || '0', 10);
        if (memoryLimit > 0) {
          task.setMemoryLimit(Math.floor(memoryLimit / 1024 / 1024));
        }
      } else if (row.type === 'problem-examples') {
        for (const child of row.children ?? []) {
          if (child.type === 'problem-example-hint') {
            const input = await this.fetchExample(child.attr['input-ref']);
            const output = await this.fetchExample(child.attr['output-ref']);
            task.addTest(input, output);
          } else if (child.type === 'problem-example-inline') {
            task.addTest(resolve(child.attr.input ?? ''), resolve(child.attr.output ?? ''));
          }
        }
      }
    }

    return task.build();
  }

  /**
   * Parses the React Server Components payload that Next.js embeds in the page.
   * It consists of `<id>:<json>\n` rows, plus `<id>:T<hex byte length>,<text>` rows for large strings,
   * which are not newline-terminated and are referenced from other rows as `$<id>`.
   */
  private getFlightData(elem: Element): FlightData {
    let payload = '';
    for (const script of elem.querySelectorAll('script')) {
      const match = /^\s*self\.__next_f\.push\((.*)\)\s*;?\s*$/s.exec(script.textContent);
      if (match === null) {
        continue;
      }

      const chunk = JSON.parse(match[1]);
      if (chunk[0] === 1 && typeof chunk[1] === 'string') {
        payload += chunk[1];
      }
    }

    const bytes = new TextEncoder().encode(payload);
    const decoder = new TextDecoder();
    const decode = (start: number, end: number): string => decoder.decode(bytes.subarray(start, end));

    const data: FlightData = { rows: [], texts: {} };

    let position = 0;
    while (position < bytes.length) {
      const colon = bytes.indexOf(0x3a, position);
      if (colon === -1) {
        break;
      }

      const id = decode(position, colon);

      if (bytes[colon + 1] === 0x54) {
        const comma = bytes.indexOf(0x2c, colon);
        const length = parseInt(decode(colon + 2, comma), 16);

        data.texts[id] = decode(comma + 1, comma + 1 + length);
        position = comma + 1 + length;
      } else {
        let end = bytes.indexOf(0x0a, colon);
        if (end === -1) {
          end = bytes.length;
        }

        try {
          data.rows.push(JSON.parse(decode(colon + 1, end)));
        } catch (err) {
          // Not all rows are plain JSON (e.g. module imports), those are not interesting
        }

        position = end + 1;
      }
    }

    return data;
  }

  private findProblem(value: any): any {
    if (typeof value !== 'object' || value === null) {
      return null;
    }

    if (Array.isArray(value.content?.render?.children)) {
      return value;
    }

    for (const child of Object.values(value)) {
      const problem = this.findProblem(child);
      if (problem !== null) {
        return problem;
      }
    }

    return null;
  }

  private resolveString(value: string, texts: Record<string, string>): string {
    if (value.startsWith('$$')) {
      return value.substring(1);
    }

    if (value.startsWith('$')) {
      return texts[value.substring(1)] ?? value;
    }

    return value;
  }

  private async fetchExample(url: string): Promise<string> {
    // eolympusercontent.com only allows simple, credential-less CORS requests, which rules out request()
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`The network response was not ok (status code: ${response.status}, url: ${url}).`);
    }

    return response.text();
  }
}
