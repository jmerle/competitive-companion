import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { fetchZip } from '../../utils/zip';
import { Parser } from '../Parser';

export class UniversalCupProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://contest.ucup.ac/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Universal Cup').setUrl(url);

    await task.setName(elem.querySelector('h1.text-center').textContent.replace(/\s+/g, ' ').trim());
    task.setCategory(elem.querySelector('h1.text-left').textContent.replace(/\s+/g, ' ').trim());

    const attachmentsUrl = elem.querySelector<HTMLLinkElement>('a.nav-link[href^="/download"]').href;

    try {
      const files = await fetchZip(attachmentsUrl, ['.in', '.ans']);

      const testCases: Record<string, { input: string; output: string }> = {};
      for (const [fileName, fileContent] of Object.entries(files)) {
        const fileNumber = fileName.match(/(\d+)/)?.[0];

        if (fileNumber) {
          testCases[fileNumber] = testCases[fileNumber] || { input: '', output: '' };
          const fileType = fileName.endsWith('.in') ? 'input' : 'output';
          testCases[fileNumber][fileType] = fileContent;
        }
      }

      Object.values(testCases).forEach(t => task.addTest(t.input, t.output, false));
    } catch (error) {
      console.error('Error extracting test cases from ZIP:', error);
    }

    return task.build();
  }
}
