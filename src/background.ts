import { Message, MessageAction } from "./models/messaging";
import axios from 'axios';

declare global {
  const chrome: any;
}

function checkTab(tabId: number, changeInfo: object, tab: browser.tabs.Tab) {
  browser.tabs.sendMessage(tabId, {
    action: MessageAction.CheckTab,
    payload: {
      tabId,
      url: tab.url,
    },
  });
}

function parse(tab: browser.tabs.Tab) {
  browser.tabs.sendMessage(tab.id, {
    action: MessageAction.Parse
  });
}

function send(tabId: number, message: string) {
  axios.post('http://localhost:4243', message, {
    timeout: 500,
  }).catch(() => {
    browser.tabs.sendMessage(tabId, {
      action: MessageAction.TaskSent,
    });
  });
}

function handleMessage(message: Message, sender: browser.runtime.MessageSender) {
  if (!sender.tab) return;

  switch (message.action) {
    case MessageAction.EnableParsing:
      if ((window as any).hasChromeAPIs) {
        chrome.pageAction.show(message.payload.tabId);
      } else {
        browser.pageAction.show(message.payload.tabId);
      }
      break;
    case MessageAction.DisableParsing:
      if ((window as any).hasChromeAPIs) {
        chrome.pageAction.hide(message.payload.tabId);
      } else {
        browser.pageAction.hide(message.payload.tabId);
      }
      break;
    case MessageAction.SendTask:
      send(sender.tab.id, message.payload.message);
      break;
  }
}

browser.tabs.onUpdated.addListener(checkTab);
browser.pageAction.onClicked.addListener(parse);
browser.runtime.onMessage.addListener(handleMessage);
