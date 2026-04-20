import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AlgoZenithNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://maang.in/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('AlgoZenith').setUrl(url);

    try {
      const titleNode = elem.querySelector('h1, h2, h3, h4');
      const title = titleNode?.textContent?.trim() || 'AlgoZenith Problem';
      task.setName(title);
    } catch (e) {
      console.error('AlgoZenith title parse failed', e);
      task.setName('AlgoZenith Problem');
    }

    try {
      const pageText = elem.textContent ?? '';

      const timeMatch = pageText.match(/Time\s*Limit\s*:?\s*(\d+)/i);
      if (timeMatch) {
        task.setTimeLimit(parseInt(timeMatch[1], 10) * 1000);
      }

      const memoryMatch = pageText.match(/Memory\s*Limit\s*:?\s*(\d+)/i);
      if (memoryMatch) {
        task.setMemoryLimit(parseInt(memoryMatch[1], 10));
      }
    } catch (e) {
      console.error('AlgoZenith limit parse failed', e);
    }

    try {
      let pendingInput: string | null = null;

      const headings = Array.from(
        elem.querySelectorAll('h3, h4, h5')
      );

      for (const rawHeading of headings) {
        if (!(rawHeading instanceof Element)) continue;

        const label = (rawHeading.textContent || '').trim().toLowerCase();

        if (
          !label.includes('sample input') &&
          !label.includes('sample output')
        ) {
          continue;
        }

        let content = '';

     

        const card =
          rawHeading.closest('.flex.min-w-0.flex-col') ||
          rawHeading.parentElement?.parentElement?.parentElement;

        if (card) {
          const contentNode = card.querySelector(
            '.custom-scrollbar, pre, code'
          );

          if (contentNode?.textContent?.trim()) {
            content = contentNode.textContent.trim();
          }
        }

        if (!content) {
          let node: Element | null =
            rawHeading.parentElement?.nextElementSibling ||
            rawHeading.nextElementSibling;

          while (node && !content) {
            const possible = node.querySelector(
              '.custom-scrollbar, pre, code, div[class*="overflow"], div[class*="whitespace"]'
            );

            if (possible?.textContent?.trim()) {
              const txt = possible.textContent.trim();

              if (!txt.toLowerCase().includes('copy sample')) {
                content = txt;
                break;
              }
            }

            const txt = node.textContent?.trim();
            if (
              !content &&
              txt &&
              !txt.toLowerCase().includes('copy sample')
            ) {
              content = txt;
              break;
            }

            node = node.nextElementSibling;
          }
        }

        console.log('FOUND SAMPLE BLOCK:', label, content);

        if (!content) continue;

        if (label.includes('sample input')) {
          pendingInput = content;
        } else if (
          label.includes('sample output') &&
          pendingInput !== null
        ) {
          task.addTest(pendingInput, content);
          pendingInput = null;
        }
      }

      console.log('tests parsed', task.build().tests);
    } catch (e) {
      console.error('sample parse failed', e);
    }

    console.log('pending build');
    console.log(task);

    const built = task.build();

    console.log('FINAL TESTS', built.tests);

    return built;
  }
}