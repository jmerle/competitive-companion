import assert from 'assert';
import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class FortunaOJProblemParser extends Parser {
  public static readonly domains: Record<string, string> = {
    'gmoj.net': 'GMOJ',
  };

  public getMatchPatterns(): string[] {
    return [
      `https://gmoj.net/*/#contest/show/*/*`,
      `https://gmoj.net/*/#main/show/*`,
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder(FortunaOJProblemParser.domains[new URL(url).hostname]).setUrl(url);
    const link_limits = elem.querySelector('#link_limits');
    const downloads = /showdownload\/\d+/.exec(html);
    const domain = new URL(url).hostname;

    if(link_limits == null) {
      console.assert(downloads != null, 'No link_limits or downloads found!');
      const pid=downloads[0].replace('showdownload/','');
      task.setName(FortunaOJProblemParser.domains[domain] + pid);
    } else {
      const pid = /\d+/.exec(link_limits.href)[0];
      task.setName(FortunaOJProblemParser.domains[domain] + pid);
    }

    if(downloads != null) alert('Don\'t forgot to download the sample!');

    const codeBlocks = elem.querySelectorAll('pre:not(.sh_sourceCode)');

    var sample_in:string[] = [], sample_out:string[] = [];

    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      this.splitChinese(codeBlocks[i].innerHTML).forEach((str) => {
        sample_in.push(str);
      });
      this.splitChinese(codeBlocks[i + 1].innerHTML).forEach((str) => {
        sample_out.push(str);
      });
    }

    console.assert(sample_in.length == sample_out.length, 'The number of sample in / out are not the same!');
    for (let i = 0; i < sample_in.length && i < sample_out.length; ++ i) {
      task.addTest(sample_in[i], sample_out[i]);
    }

    return task.build();
  }

  private checkChinese(str: string): boolean {
    return new RegExp("([\u4E00-\u9FFF]|[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01\u3010\u3011\uffe5])+","g").test(str);
  }

  private splitChinese(str: string): string[] {
    var result:string[]=[];
    const str_list = str.split('<br>');
    var cur='';
    for(let i of str_list) {
      if(this.checkChinese(i)) {
        if(cur.length > 0) {
          result.push(cur);
          cur='';
        }
      } else
        cur+=i+'\n';
    }
    if(cur.length > 0)
      result.push(cur);
    return result;
  }
}
