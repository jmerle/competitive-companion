import { Task } from './Task';
import { Test } from './Test';

export class UsacoTask extends Task {
  constructor(public taskId: string, public taskName: string, public contestName: string, public test: Test) {
    super();
  }

  toString(): string {
    return `usaco
      <h2>${this.contestName}</h2>
      <h2>${this.taskName}</h2>
      
      INPUT FORMAT (file ${this.taskId}.in)
      
      SAMPLE INPUT
      <pre class="in">${this.test.input}</pre>
      
      SAMPLE OUTPUT
      <pre class="out">${this.test.output}</pre>
    `;
  }
}
