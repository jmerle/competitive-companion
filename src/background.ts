import { getHosts } from './hosts/hosts';
import { Message, MessageAction } from './models/messaging';
import { sendToContent } from './utils/messaging';

async function parse(tab: browser.tabs.Tab): Promise<void> {
  try {
    await browser.tabs.executeScript(tab.id, { file: 'js/browser-polyfill.js' });
    await browser.tabs.executeScript(tab.id, { file: 'js/content.js' });
  } catch (err) {
    //
  }
}

function send(tabId: number, message: string): void {
  getHosts().then(async hosts => {
    for (const host of hosts) {
      try {
        await host.send(message);
      } catch (err) {
        //
      }
    }

    sendToContent(tabId, MessageAction.TaskSent);
  });
}

function handleMessage(message: Message | any, sender: browser.runtime.MessageSender): void {
  if (!sender.tab) {
    return;
  }

  if (message.action === MessageAction.SendTask) {
    send(sender.tab.id, message.payload.message);
  }
}

browser.browserAction.onClicked.addListener(parse);
browser.runtime.onMessage.addListener(handleMessage);
