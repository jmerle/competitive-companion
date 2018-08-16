import { getHosts } from './hosts/hosts';
import { Message, MessageAction } from './models/messaging';
import { sendToContent } from './utils/messaging';

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
    });

    Promise.all(promises).then(() => {
      sendToContent(tabId, MessageAction.TaskSent);
    });
  });
}

function handleMessage(
  message: Message | any,
  sender: browser.runtime.MessageSender,
) {
  if (!sender.tab) {
    return;
  }

  switch (message.action) {
    case MessageAction.EnablePageAction:
      browser.pageAction.show(sender.tab.id);
      break;
    case MessageAction.DisablePageAction:
      browser.pageAction.hide(sender.tab.id);
      break;
    case MessageAction.SendTask:
      send(sender.tab.id, message.payload.message);
      break;
  }
}

browser.tabs.onUpdated.addListener(checkTab);
browser.pageAction.onClicked.addListener(parse);
browser.runtime.onMessage.addListener(handleMessage);
