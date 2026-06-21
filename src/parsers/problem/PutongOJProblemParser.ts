import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Parser } from '../Parser';

export class PutongOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      '*://acm.cjlu.edu.cn/problem/*',
      '*://www.acm.cjlu.edu.cn/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    // Extract the numeric problem ID from the URL, e.g. /problem/1001
    const pid = url.split('/problem/')[1]?.split(/[?#]/)[0];
    const task = new TaskBuilder('Putong OJ').setUrl(url);

    // Fetch problem data from PutongOJ's JSON API
    const response = await fetch(`/api/problem/${pid}`);
    const data = await response.json();

    task.setName(data.title);

    // time is in milliseconds (already correct for TaskBuilder)
    task.setTimeLimit(data.time);

    // memory is in kilobytes, TaskBuilder expects megabytes
    task.setMemoryLimit(data.memory / 1024);

    // type: 1=Traditional, 2=Interaction, 3=SpecialJudge
    if (data.type === 2) {
      task.setInteractive(true);
    }

    // Add sample test case
    if (data.in?.trim()) {
      task.addTest(data.in, data.out || '');
    }

    return task.build();
  }
}
