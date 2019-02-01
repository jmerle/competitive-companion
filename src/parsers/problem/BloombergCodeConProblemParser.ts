import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class BloombergCodeConProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://codecon.bloomberg.com/*/*',
      'http://codecon.bloomberg.com/*/*',
      'https://codecon.bloomberg.com/contest/*/*',
      'http://codecon.bloomberg.com/contest/*/*',
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const task = new TaskBuilder().setUrl(url);
      this.parseMainProblem(html, task);
      resolve(task.build());
    });
  }

  private parseMainProblem(html: string, task: TaskBuilder) {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problem-page-pane > h1').textContent.trim());
    task.setGroup(elem.querySelector('.sidebar-title').textContent.trim());

    // task.setInteractive(
    //   [...elem.querySelectorAll('.section-title')].some(
    //     el => el.textContent === 'Interaction' || el.textContent === 'Протокол взаимодействия',
    //   ),
    // );

    const timeLimitStr = elem
      .querySelector('.problem-parameters > .fa-dashboard')
      .childNodes[0].textContent.split(' ')[2].split('s')[0];
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem
      .querySelector('.fa-flash')
      .childNodes[0].textContent.split(' ')[2].split('MB')[0];
    task.setMemoryLimit(parseInt(memoryLimitStr, 10));

    let inputs: any[] =[];
    let outputs: any[]= [];


    
    elem
      .querySelectorAll('.io-panel > .panel-item')
      .forEach(o => 
        {
          const text = o.childNodes[1].textContent;
          if(text=='Input') 
          {
            inputs=inputs.concat(o.childNodes[3].textContent);
          }
          else if (text=='Output')
          {
            outputs=outputs.concat(o.childNodes[3].textContent);
          }
        }
      );
    for (let i = 0; i < inputs.length; i++) {
      const input =  inputs[i];
      const output = outputs[i];

      task.addTest(input, output);
    }

    task.setJavaMainClass("Problem");
  }
}
