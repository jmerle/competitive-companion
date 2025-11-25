import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CSGOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://acm.sztu.edu.cn/csgoj/problemset/problem*',
      'https://cpc.csgrandeur.cn/csgoj/problemset/problem*',
      // 'https://acm.sztu.edu.cn/*/contest/problem*',
      // 'https://cpc.csgrandeur.cn/*/contest/problem*'
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CSGOJ').setUrl(url);
    task.setName(elem.querySelector('.problem-title').textContent);

    const infoList = elem.querySelectorAll('.info-value');
    task.setTimeLimit(Number(infoList[0].textContent.replace(' Sec', '')) * 1000);
    task.setMemoryLimit(Number(infoList[1].textContent.replace(' MB', '')));

    const inElem = elem.querySelector('#sample_input_hidden');
    const outElem = elem.querySelector('#sample_output_hidden');
    if (inElem && outElem) {
      let ipt = [], opt = [];
      try {
        ipt = JSON.parse(inElem.textContent).data;
        opt = JSON.parse(outElem.textContent).data;
      } catch(e) {
        const separator = "##CASE##";
        ipt = inElem.textContent.split(separator).map(s => s.trim()).filter(s => s.length > 0);
        opt = outElem.textContent.split(separator).map(s => s.trim()).filter(s => s.length > 0);
      }
      for (let i = 0; i < ipt.length && i < opt.length; i ++) {
        task.addTest(ipt[i], opt[i]);
      }
    } else {
      const sampledatas = [...elem.querySelectorAll('.sampledata')];
      for (let i = 0; i < sampledatas.length / 2; i ++) {
        task.addTest(sampledatas[i << 1].textContent, sampledatas[i << 1 | 1].textContent);
      }
    }

    return task.build();
  }
}
