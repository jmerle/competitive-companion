import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class DimikOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://dimikoj.com/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const doc = htmlToElement(html);
    const task = new TaskBuilder('Dimik OJ').setUrl(url);

    // don't use bangla name, it breaks code compilation in cph
    const urlParts = url.split('/');
    const problemNumber = urlParts.at(-2);
    const problemName = urlParts.at(-1).replace('-', ' ').replace(/(?<=(^| ))./g, c => c.toUpperCase());
    task.setName(`${problemNumber} ${problemName}`);

    const submissionDiv = doc.querySelector('#submission');
    const codeBlocks = [...submissionDiv.previousElementSibling.querySelectorAll('code')];

    for (let i = 0; i < codeBlocks.length + 1; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
