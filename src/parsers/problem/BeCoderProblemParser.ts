import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

export class BeCoderProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://becoder.com.cn/front-v2/problems/*', 'https://www.becoder.com.cn/front-v2/problems/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/(www\.)?becoder\.com\.cn\/front-v2\/problems\/\d+\/?(?:[?#].*)?$/];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async parse(url: string, html: string): Promise<Task> {
    const pageUrl = new URL(url);
    const problemId = /\/problems\/(\d+)/.exec(pageUrl.pathname)[1];
    const apiUrl = new URL(`/api/front-v2/problems/${problemId}${pageUrl.search}`, pageUrl.origin);
    const data: unknown = JSON.parse(await request(apiUrl.href));

    if (!data || typeof data !== 'object' || !('success' in data) || data.success !== true || !('problem' in data)) {
      const message =
        data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
          ? data.error
          : 'Unable to load the BeCoder problem. Please log in and check your access.';
      throw new Error(message);
    }

    const problem = data.problem;
    if (
      !problem ||
      typeof problem !== 'object' ||
      !('title' in problem) ||
      typeof problem.title !== 'string' ||
      !('timeLimit' in problem) ||
      typeof problem.timeLimit !== 'number' ||
      !('memoryLimit' in problem) ||
      typeof problem.memoryLimit !== 'number' ||
      !('typeText' in problem) ||
      typeof problem.typeText !== 'string' ||
      !('example' in problem) ||
      typeof problem.example !== 'string' ||
      !('fileIO' in problem) ||
      typeof problem.fileIO !== 'boolean'
    ) {
      throw new Error('The BeCoder problem response is missing required fields.');
    }

    const task = new TaskBuilder('BeCoder')
      .setUrl(url)
      .setName(problem.title)
      .setTimeLimit(problem.timeLimit)
      .setMemoryLimit(problem.memoryLimit)
      .setInteractive(/交互|interactive/i.test(problem.typeText));

    if (problem.fileIO) {
      if (
        !('fileIOInputName' in problem) ||
        typeof problem.fileIOInputName !== 'string' ||
        !('fileIOOutputName' in problem) ||
        typeof problem.fileIOOutputName !== 'string'
      ) {
        throw new Error('The BeCoder problem response is missing file IO names.');
      }
      task.setInput({ type: 'file', fileName: problem.fileIOInputName });
      task.setOutput({ type: 'file', fileName: problem.fileIOOutputName });
    }

    const samples = htmlToElement(problem.example);
    let direction: 'input' | 'output' | null = null;
    let input: string | null = null;

    for (const elem of samples.querySelectorAll('h1, h2, h3, h4, h5, h6, p, pre')) {
      const text = elem.textContent;

      if (elem.tagName !== 'PRE') {
        if (/^(?:样例输入|输入样例|sample input|input sample|input)\s*#?\s*\d*\s*[:：]?\s*$/i.test(text.trim())) {
          direction = 'input';
        } else if (
          /^(?:样例输出|输出样例|sample output|output sample|output)\s*#?\s*\d*\s*[:：]?\s*$/i.test(text.trim())
        ) {
          direction = 'output';
        }
        continue;
      }

      if (direction === 'input' && input === null) {
        input = text;
      } else if (direction === 'output') {
        task.addTest(input ?? '', text);
        input = null;
      } else {
        throw new Error('Unable to pair the BeCoder sample inputs and outputs.');
      }

      direction = null;
    }

    if (input !== null) {
      throw new Error('A BeCoder sample input has no corresponding output.');
    }

    return task.build();
  }
}
