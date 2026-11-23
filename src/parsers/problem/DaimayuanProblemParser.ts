import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export const DAIMAYUAN_DOMAIN = 'bs.daimayuan.top';

interface HydroData {
  pdoc?: {
    title?: string;
    pid?: string;
    config?: {
      timeMin?: number;
      memoryMin?: number;
    };
  };
  tdoc?: {
    title?: string;
  };
  contentHtmlByLanguage?: Record<string, string>;
}

interface SampleBlock {
  type: 'input' | 'output';
  text: string;
}

/**
 * Parses the current "dmybs" theme used by bs.daimayuan.top. It replaced the
 * classic Hydro theme handled by HydroProblemParser, so none of the old
 * selectors (.section__title, .sample, .icon-stopwatch, ...) exist anymore.
 *
 * The site is client-rendered: the live page has .problem-detail-* and
 * .problem-sample-* elements, while a page fetched with request() only has a
 * server-rendered SEO copy plus a #hydro-data JSON blob. Both forms are
 * supported so that single problems and whole contests can be parsed.
 */
export class DaimayuanProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['p/*', 'd/*/p/*', 'contest/*/p/*'].map(path => `https://${DAIMAYUAN_DOMAIN}/${path}`);
  }

  public canHandlePage(): boolean {
    return document.querySelector('.problem-detail-hero, .dmybs-seo') !== null;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const hydroData = DaimayuanProblemParser.getHydroData(elem);

    const task = new TaskBuilder('Daimayuan Online Judge').setUrl(url);

    const title =
      elem.querySelector('.problem-detail-title-row h1')?.textContent.trim() || hydroData?.pdoc?.title || '';
    const pid = hydroData?.pdoc?.pid;
    const name = DaimayuanProblemParser.cleanTitle(title, pid);
    task.setName(name);

    const contestName =
      hydroData?.tdoc?.title || elem.querySelector('.problem-detail-breadcrumb a.is-current')?.textContent.trim();
    if (contestName) {
      task.setCategory(contestName);
    }

    const metaText = elem.querySelector('.problem-detail-meta')?.textContent || '';
    const timeLimit = /(\d+)\s*ms/i.exec(metaText);
    const memoryLimit = /(\d+)\s*MiB/i.exec(metaText);

    if (timeLimit !== null) {
      task.setTimeLimit(parseInt(timeLimit[1], 10));
    } else if (hydroData?.pdoc?.config?.timeMin !== undefined) {
      task.setTimeLimit(hydroData.pdoc.config.timeMin);
    }

    if (memoryLimit !== null) {
      task.setMemoryLimit(parseInt(memoryLimit[1], 10));
    } else if (hydroData?.pdoc?.config?.memoryMin !== undefined) {
      task.setMemoryLimit(hydroData.pdoc.config.memoryMin);
    }

    const samples = DaimayuanProblemParser.getSamples(elem, hydroData);
    for (let i = 0; i < samples.length - 1; i += 2) {
      if (samples[i].type === 'input' && samples[i + 1].type === 'output') {
        task.addTest(samples[i].text, samples[i + 1].text);
      }
    }

    return task.build();
  }

  private static getHydroData(elem: Element): HydroData | null {
    try {
      const data = JSON.parse(elem.querySelector('#hydro-data')?.textContent || 'null');
      return data !== null && typeof data === 'object' ? (data as HydroData) : null;
    } catch (err) {
      return null;
    }
  }

  private static cleanTitle(title: string, pid?: string): string {
    if (pid) {
      const prefix = new RegExp(`^#\\s*${pid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\s*`);
      return title.replace(prefix, '');
    }

    return title.replace(/^#\s*\S+\.\s*/, '');
  }

  private static getSamples(elem: Element, hydroData: HydroData | null): SampleBlock[] {
    const groups = [...elem.querySelectorAll('.problem-sample-group')];
    if (groups.length > 0) {
      const samples: SampleBlock[] = [];

      for (const group of groups) {
        for (const panel of group.querySelectorAll('.problem-sample-panel')) {
          const code = panel.querySelector('pre > code');
          if (code === null) {
            continue;
          }

          const label = panel.querySelector('h4')?.textContent.trim() || '';
          const className = code.className;
          const type =
            /输入|input/i.test(label) || /language-input/i.test(className)
              ? 'input'
              : /输出|output/i.test(label) || /language-output/i.test(className)
                ? 'output'
                : null;

          if (type !== null) {
            samples.push({ type, text: code.textContent });
          }
        }
      }

      if (samples.length > 0) {
        return samples;
      }
    }

    // Server-rendered copy: sample code blocks are plain <pre><code> elements
    // with a language-inputN / language-outputN class.
    let samples = DaimayuanProblemParser.getCodeSamples(elem);
    if (samples.length > 0) {
      return samples;
    }

    // Older problems use "样例输入 #1" / "样例输出 #1" headings instead.
    samples = DaimayuanProblemParser.getHeadingSamples(elem);
    if (samples.length > 0) {
      return samples;
    }

    // Last resort: the problem statement is also embedded in #hydro-data.
    const content = hydroData?.contentHtmlByLanguage;
    if (content !== undefined) {
      for (const html of Object.values(content)) {
        const statement = htmlToElement(html);

        const fromData = DaimayuanProblemParser.getCodeSamples(statement);
        if (fromData.length > 0) {
          return fromData;
        }

        const fromHeadings = DaimayuanProblemParser.getHeadingSamples(statement);
        if (fromHeadings.length > 0) {
          return fromHeadings;
        }
      }
    }

    return [];
  }

  private static getHeadingSamples(root: Element): SampleBlock[] {
    const samples: SampleBlock[] = [];

    for (const heading of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
      const headingText = heading.textContent.trim();
      let type: 'input' | 'output' | null = null;

      if (/样例\s*输入|输入\s*样例|sample\s*input/i.test(headingText)) {
        type = 'input';
      } else if (/样例\s*输出|输出\s*样例|sample\s*output/i.test(headingText)) {
        type = 'output';
      }

      if (type === null) {
        continue;
      }

      let container = heading.nextElementSibling;
      while (
        container !== null &&
        container.matches('pre') === false &&
        container.querySelector('pre > code') === null
      ) {
        container = container.nextElementSibling;
      }

      if (container === null) {
        continue;
      }

      const code = container.matches('pre') ? container.querySelector('code') : container.querySelector('pre > code');
      if (code !== null) {
        samples.push({ type, text: code.textContent });
      }
    }

    return samples;
  }

  private static getCodeSamples(root: Element): SampleBlock[] {
    const samples: SampleBlock[] = [];

    for (const code of root.querySelectorAll('pre > code')) {
      const className = code.className;
      let type: 'input' | 'output' | null = null;

      if (/language-input/i.test(className)) {
        type = 'input';
      } else if (/language-output/i.test(className)) {
        type = 'output';
      }

      if (type !== null) {
        samples.push({ type, text: code.textContent });
      }
    }

    return samples;
  }
}
