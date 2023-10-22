import { Task } from '../../models/Task';
import { TLXProblemParser } from '../problem/TLXProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class TLXContestParser extends SimpleContestParser {
  protected linkSelector =
    'div.contest-problem-card.content-card a.content-card-link, div.problemset-problem-card.content-card a.content-card-link';
  protected problemParser = new TLXProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://tlx.toki.id/contests/*/problems', 'https://tlx.toki.id/problems/*'];
  }

  protected async parseTask(url: string): Promise<Task> {
    // we need this to load the statement dynamically (it's loaded by JavaScript),
    // and whether the statement is loaded (frame.contentDocument.readyState=="complete" doesn't work)
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    document.body.appendChild(frame);
    await new Promise(resolve => {
      frame.addEventListener('load', () => {
        const observer = new MutationObserver(() => {
          if (frame.contentDocument.body.querySelector('.programming-problem-statement__name')) {
            observer.disconnect();
            resolve(null);
          }
        });
        observer.observe(frame.contentDocument.body, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false,
        });
      });
      frame.src = url;
    });
    const content = frame.contentDocument.body.innerHTML;
    frame.remove();
    const task = await this.problemParser.parse(url, content);
    return task as Task;
  }
}
