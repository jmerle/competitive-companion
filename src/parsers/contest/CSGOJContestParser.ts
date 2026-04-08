import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';

interface CSGOJContestProblem {
  num?: number;
  problem_id_show?: string;
}

export class CSGOJContestParser extends ContestParser<string> {
  public canHandlePage(): boolean {
    return document.querySelector('#contest_problem_table') !== null;
  }

  public getMatchPatterns(): string[] {
    return [
      'https://acm.sztu.edu.cn/*/contest/problemset*',
      'https://acm.sztu.edu.cn:40080/*/contest/problemset*',
      'https://cpc.csgrandeur.cn/*/contest/problemset*',
      'http://acm.sztu.edu.cn:50100/*/*/problemset*',
    ];
  }

  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const taskUrls = this.getTaskUrlsFromHtml(html);
    if (taskUrls.length > 0) {
      return taskUrls;
    }

    const problemsetUrl = new URL(url);
    const ajaxUrl = new URL(problemsetUrl.toString());
    ajaxUrl.pathname = ajaxUrl.pathname.replace(/problemset\/?$/, 'problemset_ajax');

    const body = await request(ajaxUrl.toString(), {
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const problems = JSON.parse(body) as CSGOJContestProblem[];
    const problemUrl = new URL(problemsetUrl.toString());
    problemUrl.pathname = problemUrl.pathname.replace(/problemset\/?$/, 'problem');

    return problems.map(problem => {
      const taskUrl = new URL(problemUrl.toString());
      taskUrl.searchParams.set('pid', this.getContestProblemId(problem));
      return taskUrl.toString();
    });
  }

  protected async parseTask(url: string): Promise<Task> {
    const body = await request(url);
    return this.parseProblemPage(url, body);
  }

  private getTaskUrlsFromHtml(html: string): string[] {
    const elem = htmlToElement(html);
    const anchors = Array.from(elem.querySelectorAll('#contest_problem_table a.contest_problem_title[href]')).concat(
      Array.from(elem.querySelectorAll('#contest_problem_table tbody a[href]')),
    );
    const uniqueUrls = new Set(anchors.map(anchor => (anchor as HTMLAnchorElement).href).filter(Boolean));

    return Array.from(uniqueUrls);
  }

  private getContestProblemId(problem: CSGOJContestProblem): string {
    if (typeof problem.num === 'number' && Number.isFinite(problem.num)) {
      return String.fromCharCode('A'.charCodeAt(0) + problem.num);
    }

    const label = problem.problem_id_show?.match(/^([A-Z]+)/)?.[1];
    if (label) {
      return label;
    }

    throw new Error('Failed to determine the contest problem id.');
  }

  private parseProblemPage(url: string, html: string): Task {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CSGOJ').setUrl(url);

    const name = elem.querySelector('.problem-title')?.textContent?.trim();
    if (!name) {
      throw new Error('Failed to find the problem title.');
    }

    task.setName(name);
    task.setTimeLimit(this.parseTimeLimit(elem));
    task.setMemoryLimit(this.parseMemoryLimit(elem));
    this.addSamples(task, elem);

    return task.build();
  }

  private parseTimeLimit(elem: Element): number {
    const item = this.getInfoItem(elem, /time\s*limit/i);
    const value = Number(item?.querySelector('.info-value')?.textContent?.trim());

    if (!Number.isFinite(value)) {
      throw new Error('Failed to parse the time limit.');
    }

    const unit = item?.querySelector('.info-unit')?.textContent ?? '';
    return /\bms\b/i.test(unit) ? value : value * 1000;
  }

  private parseMemoryLimit(elem: Element): number {
    const item = this.getInfoItem(elem, /memory\s*limit/i);
    const value = Number(item?.querySelector('.info-value')?.textContent?.trim());

    if (!Number.isFinite(value)) {
      throw new Error('Failed to parse the memory limit.');
    }

    const unit = item?.querySelector('.info-unit')?.textContent ?? '';
    if (/\b(?:gb|gib)\b/i.test(unit)) {
      return value * 1024;
    }

    if (/\b(?:kb|kib)\b/i.test(unit)) {
      return value / 1024;
    }

    return value;
  }

  private getInfoItem(elem: Element, matcher: RegExp): Element | null {
    for (const item of Array.from(elem.querySelectorAll('.info-item'))) {
      const label = item.querySelector('.info-label')?.textContent ?? '';
      if (matcher.test(label)) {
        return item;
      }
    }

    return null;
  }

  private addSamples(task: TaskBuilder, elem: Element): void {
    const hiddenInput = elem.querySelector('#sample_input_hidden')?.textContent ?? '';
    const hiddenOutput = elem.querySelector('#sample_output_hidden')?.textContent ?? '';

    if (hiddenInput || hiddenOutput) {
      const inputs = this.parseSampleData(hiddenInput);
      const outputs = this.parseSampleData(hiddenOutput);

      for (let i = 0; i < inputs.length && i < outputs.length; i++) {
        task.addTest(inputs[i], outputs[i]);
      }

      return;
    }

    const inputSamples = Array.from(elem.querySelectorAll('.sampledata[data-sample-type="input"], .sample_input_area'));
    const outputSamples = Array.from(
      elem.querySelectorAll('.sampledata[data-sample-type="output"], .sample_output_area'),
    );

    if (inputSamples.length > 0 && outputSamples.length > 0) {
      for (let i = 0; i < inputSamples.length && i < outputSamples.length; i++) {
        task.addTest(inputSamples[i].textContent ?? '', outputSamples[i].textContent ?? '');
      }

      return;
    }

    const sampleData = Array.from(elem.querySelectorAll('.sampledata'));
    for (let i = 0; i + 1 < sampleData.length; i += 2) {
      task.addTest(sampleData[i].textContent ?? '', sampleData[i + 1].textContent ?? '');
    }
  }

  private parseSampleData(raw: string): string[] {
    const value = raw.trim();
    if (value.length === 0) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as { data?: unknown };
      if (Array.isArray(parsed.data)) {
        return parsed.data.map(sample => String(sample));
      }
    } catch {
      // Fall through to legacy formats.
    }

    if (value.includes('##CASE##')) {
      return value
        .split('##CASE##')
        .map(sample => sample.trim())
        .filter(sample => sample.length > 0);
    }

    return [value];
  }
}
