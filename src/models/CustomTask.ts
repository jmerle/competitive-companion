import { Task } from './Task';
import { Test } from './Test';

export class CustomTask extends Task {
  constructor(public taskName: string, public contestName: string, public tests: Test[], public memoryLimit: number) {
    super();
  }

  toString(): string {
    const tests = this.tests.map(test => `
      <table class="sample" summary="sample data">
        <pre>${test.input}</pre>
        <pre>${test.output}</pre>
      </table>
    `).join('');

    return `kattis
      <div id="contest_time">
        <h2 class="title">${this.contestName}</h2>
      </div>

      <div class="headline-wrapper"><h1>${this.taskName}</h1></div>

      <div class="text-center"><h1>${this.taskName}</h1></div>

      ${tests}

      <p><strong>Memory limit: </strong>${this.memoryLimit} MB</p>
    `;
  }
}
