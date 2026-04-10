import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { VirtualJudgeProblemParser } from '../problem/VirtualJudgeProblemParser';

interface VjudgeProblemEntry {
  num: string;
  title: string;
  descKey: string;
}

export class VirtualJudgeContestParser extends ContestParser<[string, string, VjudgeProblemEntry]> {
  private problemParser = new VirtualJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://vjudge.net/contest/*', 'https://vjudge.net.cn/contest/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector('#contest-problems tr > .prob-title > a') !== null;
  }

  protected async getTasksToParse(html: string, url: string): Promise<[string, string, VjudgeProblemEntry][]> {
    const elem = htmlToElement(html);

    // The contest title is now in a plain h3 within the page header.
    // Previously it was nested as #time-info > .row > .col-xs-6 > h3.
    const categoryEl =
      elem.querySelector<HTMLElement>('#time-info h3') ??
      elem.querySelector<HTMLElement>('h3');
    const category = categoryEl ? categoryEl.textContent.trim() : 'Virtual Judge';

    // The old `textarea[name="dataJson"]` blob no longer exists.
    // Problem data is now rendered as a table in #contest-problems.
    // Each row contains:
    //   - A letter cell in the `#` column
    //   - A `.prob-title a[href="#problem/X"]` link with the display title
    //   - A PDF link `/contest/{id}/problemPdf/{letter}?descKey={key}` that
    //     exposes the descKey required by the description API.
    const rows = [...elem.querySelectorAll<HTMLTableRowElement>('#contest-problems tr')];

    const problems: VjudgeProblemEntry[] = [];
    for (const row of rows) {
      const titleLink = row.querySelector<HTMLAnchorElement>('.prob-title a');
      if (titleLink === null) continue;

      // Problem letter: the href is "#problem/A", so take the last segment.
      const hrefLetter = titleLink.getAttribute('href')?.split('/').pop() ?? '';

      // descKey is embedded in the PDF download link href as a query parameter.
      const pdfLink = row.querySelector<HTMLAnchorElement>(`a[href*="/problemPdf/"]`);
      const descKey = pdfLink
        ? new URL(pdfLink.href, 'https://vjudge.net').searchParams.get('descKey') ?? ''
        : '';

      problems.push({
        num: hrefLetter,
        title: titleLink.textContent.trim(),
        descKey,
      });
    }

    return problems.map(p => [url, category, p]);
  }

  protected async parseTask([url, category, data]: [string, string, VjudgeProblemEntry]): Promise<Task> {
    const contestUrl = url.split('#')[0];
    const task = new TaskBuilder('Virtual Judge').setUrl(`${contestUrl}#problem/${data.num}`);

    task.setName(`${data.num} - ${data.title}`);
    task.setCategory(category);

    // Fetch limits and sample tests from the description API.
    // The API endpoint is unchanged; we now source descKey from the PDF link.
    if (data.descKey) {
      const descriptionUrl = `https://vjudge.net/problem/description/${data.descKey}`;
      const description = await request(descriptionUrl, { credentials: 'same-origin' });
      const descElem = htmlToElement(description);
      const jsonContainer = descElem.querySelector('.data-json-container');

      if (jsonContainer !== null) {
        const json = JSON.parse(jsonContainer.textContent);

        // Parse time/memory limits from the description JSON metadata.
        if (Array.isArray(json.properties)) {
          for (const property of json.properties) {
            const titleLower: string = (property.title ?? '').toLowerCase();
            if (titleLower === 'time limit') {
              task.setTimeLimit(parseFloat(property.content.split(' ')[0]));
            } else if (titleLower === 'memory limit' || titleLower === 'mem limit') {
              task.setMemoryLimit(parseFloat(property.content.split(' ')[0]) / 1024);
            }
          }
        }

        const codeBlocks = this.problemParser.getCodeBlocksFromDescription(json);
        for (let i = 0; i < codeBlocks.length - 1; i += 2) {
          task.addTest(codeBlocks[i], codeBlocks[i + 1]);
        }
      }
    }

    return task.build();
  }
}
