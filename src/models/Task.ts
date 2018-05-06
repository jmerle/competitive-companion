import { Message, MessageAction } from './messaging';
import { Sendable } from './Sendable';
import { Test } from './Test';
import { InputConfiguration, OutputConfiguration } from './IOConfiguration';
import { LanguageConfiguration } from './LanguageConfiguration';
import { TestType } from './TestType';
import { sendToBackground } from '../utils/messaging';
import { Config } from '../utils/Config';
import { TaskBuilder } from './TaskBuilder';

export class Task implements Sendable {
  constructor(public name: string, public group: string, public url: string, public memoryLimit: number, public timeLimit: number,
              public tests: Test[], public testType: TestType, public input: InputConfiguration, public output: OutputConfiguration,
              public languages: LanguageConfiguration) {
  }

  send(): Promise<void> {
    return new Promise(resolve => {
      Config.get<boolean>('debugMode').then(debug => {
        if (debug) {
          console.log(JSON.stringify(this, null, 4));
        }
      }).catch(console.error);

      const handleMessage = (message: Message, sender: browser.runtime.MessageSender) => {
        if (sender.tab) return;

        if (message.action === MessageAction.TaskSent) {
          browser.runtime.onMessage.removeListener(handleMessage);
          resolve();
        }
      };

      browser.runtime.onMessage.addListener(handleMessage);

      sendToBackground(MessageAction.SendTask, { message: JSON.stringify(this) });
    });
  }

  static fromJSON(data: string) {
    const task = new TaskBuilder();

    const obj = JSON.parse(data);

    task.setUrl(obj.url);
    task.setName(obj.name);
    task.setGroup(obj.group);

    task.setMemoryLimit(obj.memoryLimit);
    task.setTimeLimit(obj.timeLimit);

    task.setTestType(obj.testType);
    task.setInput(obj.input);
    task.setOutput(obj.output);

    task.setJavaMainClass(obj.languages.java.mainClass);
    task.setJavaTaskClass(obj.languages.java.taskClass);

    obj.tests.forEach((test: any) => {
      task.addTest(new Test(test.input, test.output));
    });

    return task.build();
  }
}
