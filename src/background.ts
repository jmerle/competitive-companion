import { Message, MessageAction } from './models/messaging';
import { disablePageAction, enablePageAction } from './utils/page-action';
import { sendToContent } from './utils/messaging';
import { getHosts } from './hosts/hosts';

function checkTab(tabId: number, changeInfo: object, tab: browser.tabs.Tab) {
  sendToContent(tabId, MessageAction.CheckTab, {
    tabId,
    url: tab.url,
  });
}

function parse(tab: browser.tabs.Tab) {
  sendToContent(tab.id, MessageAction.Parse);
}

function send(tabId: number, message: string) {
  getHosts().then(hosts => {
      const promises = hosts.map(host => {
          return host
            .send(message)
            .then(() => true)
            .catch(() => false);
        }
      );

      Promise.all(promises).then(() => {
        sendToContent(tabId, MessageAction.TaskSent);
      });
    }
  );
}

function handleMessage(message: Message, sender: browser.runtime.MessageSender) {
  if (!sender.tab) return;

  switch (message.action) {
    case MessageAction.EnablePageAction:
      enablePageAction(sender.tab.id);
      break;
    case MessageAction.DisablePageAction:
      disablePageAction(sender.tab.id);
      break;
    case MessageAction.SendTask:
      send(sender.tab.id, message.payload.message);
      break;
  }
}

browser.tabs.onUpdated.addListener(checkTab);
browser.pageAction.onClicked.addListener(parse);
browser.runtime.onMessage.addListener(handleMessage);
