import { Host } from './Host';
import { Task } from '../models/Task';

export class CHelperHost implements Host {
  send(data: string): Promise<void> {
    return new Promise(resolve => {
      // Temporary solution until JSONParser goes into CHelper Stable
      const message = this.taskToString(Task.fromJSON(data));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:4243/', true);

      xhr.timeout = 500;
      xhr.onload = () => resolve();
      xhr.ontimeout = () => resolve();

      xhr.send(message);
      xhr.send(null);
    });
  }

  taskToString(task: Task): String {
    if (task.url.includes('usaco.org')) {
      return this.toUSACO(task);
    } else if (task.url.includes('https://www.facebook.com/hackercup')) {
      return this.toFacebookHackerCup(task);
    } else if (task.url.includes('/codejam/')) {
      return this.toOldGoogleCodeJam(task);
    } else if (task.url.includes('https://codejam.withgoogle.com/')) {
      return this.toNewGoogleCodeJam(task);
    } else {
      return this.toKattis(task);
    }
  }

  toKattis(task: Task): String {
    const tests = task.tests.map(test => `
      <table class="sample" summary="sample data">
        <pre>${test.getInput()}</pre>
        <pre>${test.getOutput()}</pre>
      </table>
    `).join('');

    return `kattis
      <div id="contest_time">
        <h2 class="title">${task.group}</h2>
      </div>
      
      <div class="headline-wrapper"><h1>${task.name}</h1></div>
      
      ${tests}
      
      <p><strong>Memory limit: </strong>${task.memoryLimit} MB</p>
    `;
  }

  toUSACO(task: Task): String {
    const taskId = task.input.fileName.substr(0, task.input.fileName.indexOf('.in'));

    return `usaco
      <h2>${task.group}</h2>
      <h2>${task.name}</h2>
      
      INPUT FORMAT (file ${taskId}.in)
      
      SAMPLE INPUT
      <pre class="in">${task.tests[0].getInput()}</pre>
      
      SAMPLE OUTPUT
      <pre class="out">${task.tests[0].getOutput()}</pre>
    `;
  }

  toFacebookHackerCup(task: Task): String {
    return `facebook
      <h2 class="uiHeaderTitle">${task.group}</h2>
      
      <div class="clearfix">
        <span class>${task.name}</span>
      </div>
      
      <span class="fsm">Example input</span>
      <pre>${task.tests[0].getInput()}</pre>
      <pre>${task.tests[0].getOutput()}</pre>
    `;
  }

  toOldGoogleCodeJam(task: Task): String {
    const group = task.group.substr(16);

    return `gcj
      <div id="dsb-contest-title">${group}</div>
     
      <div id="dsb-problem-title0" class="dynamic-link">${task.name[0]}. ${task.name.split(' - ')[1]}</div>
      
      <div class="problem-io-wrapper">
        <pre class="io-content">${task.tests[0].getInput()}</pre>
        <pre class="io-content">${task.tests[0].getOutput()}</pre>
      </div>
    `;
  }

  toNewGoogleCodeJam(task: Task): String {
    return `new-gcj
      <div class="challenge__title"><h4>${task.group}</h4></div>
      
      <a class="collection-item router-link-exact-active active">${task.name}</a>
      
      <h3>Limits</h3>
      Memory limit: ${task.memoryLimit}MB
      
      <table>
        <tr>
          <td><pre class="io-content">${task.tests[0].getInput()}</pre></td>
          <td><pre class="io-content">${task.tests[0].getOutput()}</pre></td>
        </tr>
      </table>
    `;
  }
}
