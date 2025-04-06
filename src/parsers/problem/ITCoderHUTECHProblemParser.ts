import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

export class ITCoderHUTECHProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://itcoder.hutech.edu.vn/p/*', 'https://itcoder.hutech.edu.vn/contest/problem*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const doc = htmlToElement(html);
    const task = new TaskBuilder('ITCoder HUTECH').setUrl(url);

    if (!url.includes('/contest/')) {
      await this.parseNormalProblem(task, doc);
    } else {
      await this.parseContestProblem(task, doc);
    }

    return task.build();
  }

  private async parseNormalProblem(task: TaskBuilder, doc: Element): Promise<void> {
    await task.setName(doc.querySelector('h2').textContent.trim());

    const [timeLimit, memoryLimit] = [...doc.querySelectorAll('.card-body .float-right')].map(el =>
      parseInt(el.textContent.match(/\d+/)[0]),
    );

    task.setTimeLimit(timeLimit * 1000);
    task.setMemoryLimit(memoryLimit);

    this.parseTests(task, doc);
  }

  private async parseContestProblem(task: TaskBuilder, doc: Element): Promise<void> {
    const iframe = doc.querySelector<HTMLIFrameElement>('#problem-view-iframe');
    const iframeContent = await request(iframe.src);
    const iframeDoc = htmlToElement(iframeContent);

    await task.setName(iframeDoc.querySelector('.problem-view > h3').textContent.trim());
    task.setCategory(doc.querySelector('h3.contest-title').textContent.trim());

    this.parseTests(task, iframeDoc);
  }

  private parseTests(task: TaskBuilder, doc: Element): void {
    doc.querySelectorAll('.sample-test').forEach(sample => {
      const input = sample.querySelector('.sample-input-text').textContent;
      const output = sample.querySelector('.sample-output-text').textContent;
      task.addTest(input, output);
    });
  }
}
