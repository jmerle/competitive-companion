import browser, { Runtime } from 'webextension-polyfill';
import { Message, MessageAction } from '../../models/messaging';
import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { sendToBackground } from '../../utils/messaging';
import { Parser } from '../Parser';

export class GoogleCodingCompetitionsProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://codingcompetitions.withgoogle.com/codejam/round/*/*',
      'https://codingcompetitions.withgoogle.com/kickstart/round/*/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Google Coding Competitions').setUrl(url);

    task.setName(elem.querySelector('title').textContent.split(' - ')[0].trim());
    task.setCategory(elem.querySelector('.competition-nav p.headline-5').textContent);

    const container = elem.querySelector('.problem-description');

    const interactiveText = html.includes('This problem is interactive');
    const interactiveHeader = [...container.querySelectorAll('h3')].some(
      el => (el as any).textContent === 'Sample interaction',
    );

    task.setInteractive(interactiveText || interactiveHeader);

    const oldBlocks = container.querySelectorAll('.problem-io-wrapper pre.io-content');
    for (let i = 0; i < oldBlocks.length - 1; i += 2) {
      task.addTest(oldBlocks[i].textContent, oldBlocks[i + 1].textContent);
    }

    const newBlocks = container.querySelectorAll('.problem-io-wrapper-new .sampleio-wrapper > div');
    for (let i = 0; i < newBlocks.length - 1; i += 2) {
      task.addTest(await this.getNewBlockContent(newBlocks[i]), await this.getNewBlockContent(newBlocks[i + 1]));
    }

    try {
      task.setTimeLimit(parseFloat(/Time limit: ([0-9.]+) second/.exec(container.textContent)[1]) * 1000);
    } catch (err) {
      task.setTimeLimit(30000);
    }

    try {
      task.setMemoryLimit(parseInt(/Memory limit: (\d+)GB/.exec(container.textContent)[1], 10) * 1024);
    } catch (err) {
      task.setMemoryLimit(1024);
    }

    task.setJavaMainClass('Solution');
    task.setTestType(TestType.MultiNumber);

    return task.build();
  }

  private async getNewBlockContent(block: Element): Promise<string> {
    return new Promise(resolve => {
      const preContent = block.querySelector('pre').textContent;

      // If the copy button is hidden there are lines omitted in the pre
      // In that case the only way to get the full content is to download it
      if (block.querySelector('.sample-header-copy-button-hidden') !== null) {
        const handleMessage = (message: Message | any, sender: Runtime.MessageSender): void => {
          if (sender.tab) {
            return;
          }

          if (message.action === MessageAction.GCCFileResult) {
            browser.runtime.onMessage.removeListener(handleMessage);
            resolve(message.payload.content);
          } else if (message.action === MessageAction.GCCRequestFailed) {
            browser.runtime.onMessage.removeListener(handleMessage);
            resolve(preContent);
          }
        };

        browser.runtime.onMessage.addListener(handleMessage);

        sendToBackground(MessageAction.SendGCCFile, {
          link: block.querySelector<HTMLLinkElement>('.sample-header-download-button > a').href,
        });
      } else {
        resolve(preContent);
      }
    });
  }
}
