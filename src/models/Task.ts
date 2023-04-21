import browser, { Runtime } from 'webextension-polyfill';
import { config } from '../utils/config';
import { sendToBackground } from '../utils/messaging';
import { noop } from '../utils/noop';
import { Batch } from './Batch';
import { InputConfiguration, OutputConfiguration } from './IOConfiguration';
import { LanguageConfiguration } from './LanguageConfiguration';
import { Message, MessageAction } from './messaging';
import { Sendable } from './Sendable';
import { TaskBuilder } from './TaskBuilder';
import { Test } from './Test';
import { TestType } from './TestType';

export class Task implements Sendable {
  public static fromJSON(data: string): Task {
    const task = new TaskBuilder('');

    const obj = JSON.parse(data);

    task.setName(obj.name);
    task.setGroup(obj.group);

    task.setUrl(obj.url);
    task.setInteractive(obj.interactive);

    task.setMemoryLimit(obj.memoryLimit);
    task.setTimeLimit(obj.timeLimit);

    task.setTestType(obj.testType);
    task.setInput(obj.input);
    task.setOutput(obj.output);

    task.setJavaMainClass(obj.languages.java.mainClass);
    task.setJavaTaskClass(obj.languages.java.taskClass);

    obj.tests.forEach((test: any) => {
      task.addTest(test.input, test.output, false);
    });

    return task.build();
  }

  public constructor(
    public name: string,
    public group: string,
    public url: string,
    public interactive: boolean,
    public memoryLimit: number,
    public timeLimit: number,
    public tests: Test[],
    public testType: TestType,
    public input: InputConfiguration,
    public output: OutputConfiguration,
    public languages: LanguageConfiguration,
    public batch: Batch,
  ) {}

  public async send(): Promise<void> {
    return new Promise(resolve => {
      config
        .get('debugMode')
        .then(isDebug => {
          if (isDebug) {
            console.log(JSON.stringify(this, null, 4));
          }
        })
        .catch(noop);

      const handleMessage = (message: Message | any, sender: Runtime.MessageSender): void => {
        if (sender.tab) {
          return;
        }

        if (message.action === MessageAction.TaskSent) {
          browser.runtime.onMessage.removeListener(handleMessage);
          resolve();
        }
      };

      browser.runtime.onMessage.addListener(handleMessage);

      sendToBackground(MessageAction.SendTask, {
        message: JSON.stringify(this),
      });
    });
  }
}
