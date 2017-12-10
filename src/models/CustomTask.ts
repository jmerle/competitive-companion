import Task from "./Task";
import Test from "./Test";

export default class CustomTask extends Task {
  constructor(public taskName: string, public contestName: string, public tests: Test[], public memoryLimit: number) {
    super();
  }

  toString(): string {
    const tests = this.tests.map(test => `
      <td><pre>${test.input}</pre></td>
      <td><pre>${test.output}</pre></td>
    `).join('');

    return `csacademy
      <div class="text-center"><h1>${this.taskName}</h1></div>
      
      <br>Memory limit: <em>${this.memoryLimit} </em>
      
      ${tests}
      
      "contest":""
      "longName":"${this.contestName}"
    `;
  }
}
