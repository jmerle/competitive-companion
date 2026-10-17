import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export class JungolProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['*://*.jungol.co.kr/*'];
  }

  public getRegularExpressions(): RegExp[] {
    // Prefixes include locales, contest/lecture contexts and development base paths.
    return [
      /^https?:\/\/(?:[a-z0-9-]+\.)*jungol\.co\.kr(?::\d+)?(?:\/[^/?#]+)*\/(?:problem\/[1-9]\d*|book\/[a-zA-Z0-9_-]+\/[1-9]\d*)\/?(?:[?#].*)?$/i,
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    if (!this.getRegularExpressions().some(pattern => pattern.test(url))) {
      throw new Error('This is not a supported JUNGOL problem URL.');
    }

    const currentUrl = new URL(url);
    currentUrl.search = '';
    currentUrl.hash = '';

    const elements = htmlToElement(html).querySelectorAll('[id="competitive-companion"]');
    if (
      elements.length !== 1 ||
      !elements[0].matches('script[type="application/json"]') ||
      elements[0].hasAttribute('src')
    ) {
      throw new Error(
        'JUNGOL problem data is unavailable. Wait for the problem to load; this problem may not support export.',
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(elements[0].textContent);
    } catch {
      throw new Error('JUNGOL problem data is not valid JSON.');
    }

    if (!isRecord(data) || data.schemaVersion !== 1 || !isRecord(data.problem)) {
      throw new Error('Unsupported JUNGOL problem data version.');
    }

    const problem = data.problem;
    if (
      typeof problem.name !== 'string' ||
      !problem.name.startsWith('JUNGOL_') ||
      typeof problem.group !== 'string' ||
      !(problem.group === 'JUNGOL' || problem.group.startsWith('JUNGOL - ')) ||
      typeof problem.url !== 'string'
    ) {
      throw new Error('Invalid JUNGOL problem identity.');
    }

    let problemUrl: URL;
    try {
      problemUrl = new URL(problem.url);
    } catch {
      throw new Error('Invalid JUNGOL problem URL.');
    }
    problemUrl.search = '';
    problemUrl.hash = '';
    if (problemUrl.username || problemUrl.password || problemUrl.href !== currentUrl.href) {
      throw new Error('JUNGOL problem data does not belong to the current page. Reload the problem and try again.');
    }

    if (
      problem.interactive !== false ||
      problem.testType !== 'single' ||
      !isRecord(problem.input) ||
      problem.input.type !== 'stdin' ||
      !isRecord(problem.output) ||
      problem.output.type !== 'stdout'
    ) {
      throw new Error('This JUNGOL problem does not use supported standard input/output.');
    }

    if (
      typeof problem.timeLimit !== 'number' ||
      !Number.isFinite(problem.timeLimit) ||
      problem.timeLimit < 1 ||
      typeof problem.memoryLimit !== 'number' ||
      !Number.isFinite(problem.memoryLimit) ||
      // JUNGOL uses zero when no memory limit is specified.
      (problem.memoryLimit !== 0 && problem.memoryLimit < 1)
    ) {
      throw new Error('Invalid JUNGOL time or memory limit.');
    }

    if (!isRecord(problem.languages) || !isRecord(problem.languages.java)) {
      throw new Error('Invalid JUNGOL Java configuration.');
    }
    const java = problem.languages.java;
    if (
      java.mainClass !== 'Main' ||
      typeof java.taskClass !== 'string' ||
      !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(java.taskClass) ||
      java.taskClass === java.mainClass
    ) {
      throw new Error('Invalid JUNGOL Java class name.');
    }

    if (!Array.isArray(problem.tests)) {
      throw new Error('Invalid JUNGOL sample tests.');
    }

    // Copy only the public contract fields; the extension generates its own batch.
    const task = new TaskBuilder('JUNGOL')
      .setName(problem.name)
      .setGroup(problem.group)
      .setUrl(currentUrl.href)
      .setTimeLimit(problem.timeLimit)
      .setMemoryLimit(problem.memoryLimit)
      .setJavaMainClass(java.mainClass)
      .setJavaTaskClass(java.taskClass);

    for (const test of problem.tests) {
      if (!isRecord(test) || typeof test.input !== 'string' || typeof test.output !== 'string') {
        throw new Error('Invalid JUNGOL sample input/output pair.');
      }
      task.addTest(test.input, test.output, false);
    }

    return task.build();
  }
}
