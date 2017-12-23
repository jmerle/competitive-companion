import { Message, MessageAction } from "./messaging";
import Sendable from "./Sendable";

export default abstract class Task implements Sendable {
  send(): Promise<void> {
    return new Promise(resolve => {
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
          message: this.toString(),
        },
      });
    });
  }
}
