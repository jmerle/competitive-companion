import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

export class UDebugProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.udebug.com/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('uDebug').setUrl(url);

    await task.setName(elem.querySelector('.problem-title').textContent);
    task.setCategory(elem.querySelector('.category').textContent);

    if (task.category === 'Facebook Hacker Cup' || task.category === 'Google Code Jam') {
      task.setTestType(TestType.MultiNumber);
    }

    const inputs = elem.querySelectorAll('tr > td:nth-child(2) > a.input_desc[data-id]');
    for (let i = 0; i < inputs.length; i++) {
      const test = await this.fetchTest(elem, inputs[i].getAttribute('data-id'));
      task.addTest(test[0], test[1]);
      window.nanoBar.advance(100 / inputs.length);
    }

    return task.build();
  }

  private async fetchTest(elem: Element, id: string): Promise<[string, string]> {
    const input = await this.fetchInput(id);
    const output = await this.fetchOutput(elem, input);

    return [input, output];
  }

  private async fetchInput(id: string): Promise<string> {
    const inputData = new FormData();
    inputData.set('input_nid', id);

    const inputResponse = await this.postForm(
      'https://www.udebug.com/udebug-custom-get-selected-input-ajax',
      inputData,
    );

    return JSON.parse(inputResponse).input_value;
  }

  private async fetchOutput(elem: Element, input: string): Promise<string> {
    const form = elem.querySelector<HTMLFormElement>('#udebug-custom-problem-view-input-output-form');

    const outputData = new FormData(form);
    outputData.set('input_data', input);

    const outputResponse = await this.postForm(form.action, outputData);

    return htmlToElement(outputResponse).querySelector<HTMLTextAreaElement>('#edit-output-data').value;
  }

  private postForm(url: string, data: FormData): Promise<string> {
    return request(url, {
      method: 'POST',
      body: new URLSearchParams(data as any).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}
