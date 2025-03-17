import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { fetchZip } from '../../utils/zip';
import { ContestParser } from '../ContestParser';

export class DOMjudgeContestParser extends ContestParser<HTMLDivElement> {
  public getMatchPatterns(): string[] {
    // Not perfect, but this should work for all DOMjudge instances in general
    const patterns = [];

    for (const path of ['/team/problems', '/public/problems']) {
      for (const prefix of ['', '/*']) {
        for (const protocol of ['http', 'https']) {
          patterns.push(protocol + '://*' + prefix + path);
        }
      }
    }

    return patterns;
  }

  public canHandlePage(): boolean {
    // Determines if page is handled based on existence of "DOMjudge" text
    const head = document.querySelector('nav.navbar a.navbar-brand');
    return head !== null && head.textContent.includes('DOMjudge');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getTasksToParse(html: string, _url: string): Promise<HTMLDivElement[]> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const taskElements = Array.from(doc.querySelectorAll('.card-body'));

    return taskElements as HTMLDivElement[];
  }

  protected async parseTask(taskElement: HTMLDivElement): Promise<Task> {
    // This parsing is a little difficult because it should work for DOMjudge 7 and DOMjudge 8 instances.
    let title = taskElement.querySelector('.card-title, h2.card-title')?.textContent?.trim();
    title = title.replace('Problem', '').trim();

    const subtitle = taskElement.querySelector('.card-subtitle, h3.card-subtitle')?.textContent?.trim();

    const limitsText = taskElement.querySelector('h5.card-subtitle, h4.card-subtitle')?.textContent?.trim();
    const [timeLimit, memoryLimit] = this.parseLimits(limitsText);

    const problemText = taskElement.querySelector('a[href$="/text"]')?.getAttribute('href');
    let zipUrl = taskElement.querySelector('a[href$=".zip"]')?.getAttribute('href');

    const taskBuilder = new TaskBuilder('DOMjudge');
    await taskBuilder.setName(subtitle ? `${title}: ${subtitle}` : title);
    taskBuilder.setTimeLimit(timeLimit);
    taskBuilder.setMemoryLimit(memoryLimit);
    taskBuilder.interactive = taskElement.textContent.includes('testing');

    if (problemText) {
      const fullUrl = new URL(problemText, window.location.origin);
      taskBuilder.setUrl(fullUrl.toString());
    }

    if (zipUrl) {
      const fullUrl = new URL(zipUrl, window.location.origin);
      zipUrl = fullUrl.toString();
    }

    if (zipUrl) {
      const testCases = await this.fetchTestCases(zipUrl);
      testCases.forEach(testCase => taskBuilder.addTest(testCase.input, testCase.output, false));
    }

    return taskBuilder.build();
  }

  private async fetchTestCases(zipUrl: string): Promise<{ input: string; output: string }[]> {
    try {
      const files = await fetchZip(zipUrl, ['.in', '.out', '.ans']);

      const testCases: Record<string, { input: string; output: string }> = {};
      for (const [fileName, fileContent] of Object.entries(files)) {
        const fileNumber = fileName.match(/(\d+[a-zA-Z]*)/)?.[0];

        if (fileNumber) {
          testCases[fileNumber] = testCases[fileNumber] || { input: '', output: '' };
          const fileType = fileName.endsWith('.in') ? 'input' : 'output';
          testCases[fileNumber][fileType] = fileContent;
        }
      }

      return Object.values(testCases);
    } catch (error) {
      console.error('Error extracting test cases from ZIP:', error);
      return [];
    }
  }

  private parseLimits(limitsText: string | null): [number, number] {
    const defaultTime = 1000; // Default time in milliseconds
    const defaultMemory = 2048; // Default memory in MB

    const timeMatch = limitsText?.match(/(\d+\.?\d*)\s*seconds?/);
    const memoryMatch = limitsText?.match(/(\d+)\s*(MB|GB)/);

    const time = timeMatch ? parseFloat(timeMatch[1]) * 1000 : defaultTime;
    const memory = memoryMatch ? parseInt(memoryMatch[1]) * (memoryMatch[2] === 'GB' ? 1024 : 1) : defaultMemory;

    return [time, memory];
  }
}
