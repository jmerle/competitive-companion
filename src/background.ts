import { browser, Menus, Runtime, Tabs } from 'webextension-polyfill-ts';
import { getHosts } from './hosts/hosts';
import { Message, MessageAction } from './models/messaging';
import { parsers } from './parsers/parsers';
import { sendToContent } from './utils/messaging';

function createContextMenu(): void {
  browser.contextMenus.create({
    id: 'parse-with',
    title: 'Parse with',
    contexts: ['browser_action'],
  });

  browser.contextMenus.create({
    id: 'problem-parser',
    parentId: 'parse-with',
    title: 'Problem parser',
    contexts: ['browser_action'],
  });

  browser.contextMenus.create({
    id: 'contest-parser',
    parentId: 'parse-with',
    title: 'Contest parser',
    contexts: ['browser_action'],
  });

  for (const parser of parsers) {
    const name = parser.constructor.name;
    const isContestParser = name.endsWith('ContestParser');

    browser.contextMenus.create({
      id: `parse-with-${name}`,
      parentId: `${isContestParser ? 'contest' : 'problem'}-parser`,
      title: name,
      contexts: ['browser_action'],
    });
  }
}

async function loadContentScript(tab: Tabs.Tab, parserName: string): Promise<void> {
  if (tab.url.startsWith('https://codingcompetitions.withgoogle.com/')) {
    await browser.permissions.request({
      origins: ['https://codejam.googleapis.com/dashboard/get_file/*'],
    });
  }

  for (const file of ['common', 'content']) {
    await browser.tabs.executeScript(tab.id, { file: `js/${file}.js` });
  }

  sendToContent(tab.id, MessageAction.Parse, { parserName });
}

function onBrowserAction(tab: Tabs.Tab): void {
  loadContentScript(tab, null);
}

function onContextMenu(info: Menus.OnClickData, tab: Tabs.Tab): void {
  if (info.menuItemId.toString().startsWith('parse-with-')) {
    const parserName = info.menuItemId.toString().split('parse-with-').pop();
    loadContentScript(tab, parserName);
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

async function sendGCCFile(tabId: number, link: string): Promise<void> {
  try {
    const permissionGranted = await browser.permissions.contains({
      origins: ['https://codejam.googleapis.com/dashboard/get_file/*'],
    });

    if (permissionGranted) {
      const response = await fetch(link);
      const result = await response.text();

      sendToContent(tabId, MessageAction.GCCFileResult, { content: result });
    } else {
      sendToContent(tabId, MessageAction.GCCRequestFailed);
    }
  } catch (err) {
    sendToContent(tabId, MessageAction.GCCRequestFailed);
  }
}

function handleMessage(message: Message | any, sender: Runtime.MessageSender): void {
  if (!sender.tab) {
    return;
  }

  if (message.action === MessageAction.SendTask) {
    send(sender.tab.id, message.payload.message);
  } else if (message.action === MessageAction.SendGCCFile) {
    sendGCCFile(sender.tab.id, message.payload.link);
  }
}

browser.browserAction.onClicked.addListener(onBrowserAction);
browser.contextMenus.onClicked.addListener(onContextMenu);
browser.runtime.onMessage.addListener(handleMessage);

createContextMenu();
