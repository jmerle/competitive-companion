import type { Runtime } from 'webextension-polyfill';
import { browser } from '../utils/browser';
import { config } from '../utils/config';
import { sendToBackground } from '../utils/messaging';
import { noop } from '../utils/noop';
import { uuidv4 } from '../utils/random';
import { Batch } from './Batch';
import { InputConfiguration, OutputConfiguration } from './IOConfiguration';
import { LanguageConfiguration } from './LanguageConfiguration';
import { Message, MessageAction } from './messaging';
import { Sendable } from './Sendable';
import { TaskBuilder } from './TaskBuilder';
import { Test } from './Test';
import { TestType } from './TestType';

export class Task implements Sendable {
  public static async fromJSON(data: string): Promise<Task> {
    const task = new TaskBuilder('');

    const obj = JSON.parse(data);

    await task.setName(obj.name);
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
    return new Promise((resolve, reject) => {
      config
        .get('debugMode')
        .then(isDebug => {
          if (isDebug) {
            console.log(JSON.stringify(this, null, 4));
          }
        })
        .catch(noop);

      const messageId = uuidv4();

      const handleMessage = async (message: Message | any, sender: Runtime.MessageSender): Promise<void> => {
        if (sender.tab) {
          return;
        }

        if (message.action === MessageAction.SendTaskDone && message.payload.messageId === messageId) {
          browser.runtime.onMessage.removeListener(handleMessage);
          resolve(message.payload.content);
        } else if (message.action === MessageAction.SendTaskFailed && message.payload.messageId === messageId) {
          browser.runtime.onMessage.removeListener(handleMessage);
          reject(new Error(message.payload.message));
        }
      };

      browser.runtime.onMessage.addListener(handleMessage);

      sendToBackground(MessageAction.SendTask, {
        messageId,
        message: JSON.stringify(this),
      });
    });
  }
}
