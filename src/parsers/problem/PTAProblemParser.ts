import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PTAProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://pintia.cn/problem-sets/*/exam/problems/type/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {

    const elem = htmlToElement(html);
    const task = new TaskBuilder('PTA').setUrl(url);

    const container = elem.querySelector('.scroll.mt-1 > div');

    task.setName(container.querySelector("div.pc-text.pc-color-dark.whitespace-nowrap.shrink > div").textContent.trim());
    const categoryEl = elem.querySelector(".grow > a.pc-button.max-w-\\[60vw\\].ml-1.pc-button-text.pc-lg.pc-color-dark.pc-active-primary.cursor-pointer > div > div");
    task.setCategory(categoryEl ? categoryEl.textContent.trim() : '');

    const limits = container.querySelector("div.pc-list.bd-1.problemInfo_HVczC");

    const timeLimitStr = limits.querySelector("div:nth-child(2) > div.pc-text.pc-color-normal > div").textContent;
    const memoryLimitStr = limits.querySelector("div:nth-child(3) > div.pc-text.pc-color-normal > div").textContent;

    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    const inputs = elem.querySelectorAll("div[data-lang='in']")
    const outputs = elem.querySelectorAll("div[data-lang='out']")
    
    if (inputs && outputs) {
      const len = inputs.length;
      for (let i = 0; i < len; i++) {
        let input = inputs[i].querySelector("div.cm-content");
        let input_text = ""
        input.childNodes.forEach( (_) => {
          input_text += _.textContent + "\n";
        });
        input_text = input_text.slice(0, -1);
        let output = outputs[i].querySelector("div.cm-content");
        let output_text = ""
        output.childNodes.forEach( (_) => {
          output_text += _.textContent + "\n";
        });
        output_text = output_text.slice(0, -1);
        task.addTest(input_text, output_text);
      }
    }

    return task.build();
  }
}
