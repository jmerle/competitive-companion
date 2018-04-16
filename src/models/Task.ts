import { Message, MessageAction } from './messaging';
import { Sendable } from './Sendable';
import { Test } from './Test';
import { InputConfiguration, OutputConfiguration } from './IOConfiguration';
import { LanguageConfiguration } from './LanguageConfiguration';
import { TestType } from './TestType';

export class Task implements Sendable {
  constructor(public name: string, public group: string, public url: string, public memoryLimit: number, public timeLimit: number,
              public tests: Test[], public testType: TestType, public input: InputConfiguration, public output: OutputConfiguration,
              public languages: LanguageConfiguration) {
  }

  send(): Promise<void> {
    return new Promise(resolve => {
      console.dir(JSON.stringify(this, null, 4));
      resolve();

      const handleMessage = (message: Message, sender: browser.runtime.MessageSender) => {
        if (sender.tab) return;

        if (message.action === MessageAction.TaskSent) {
          browser.runtime.onMessage.removeListener(handleMessage);
          resolve();
        }
      };

      browser.runtime.onMessage.addListener(handleMessage);

      browser.runtime.sendMessage({
        action: MessageAction.SendTask,
        payload: {
          message: JSON.stringify(this),
        },
      });
    });
  }
}
