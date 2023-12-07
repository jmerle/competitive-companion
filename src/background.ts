import browser, { Menus, Runtime, Tabs } from 'webextension-polyfill';
import { getHosts } from './hosts/hosts';
import { Message, MessageAction } from './models/messaging';
import { parsers } from './parsers/parsers';
import { sendToContent } from './utils/messaging';
import { request } from './utils/request';

// When the parser is requested on a URL starting with <key>, request permission for <value>
const requiredPermissions: Record<string, string> = {
  'https://codingcompetitions.withgoogle.com/': 'https://codejam.googleapis.com/dashboard/get_file/*',
  'https://tlx.toki.id/': 'https://api.tlx.toki.id/v2/*',
};

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
  const permissionOrigins: string[] = [];
  for (const prefix in requiredPermissions) {
    if (tab.url.startsWith(prefix)) {
      permissionOrigins.push(requiredPermissions[prefix]);
    }
  }

  if (permissionOrigins.length > 0) {
    await browser.permissions.request({ origins: permissionOrigins });
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

function sendTask(tabId: number, message: string): void {
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

async function makeRequest(
  tabId: number,
  requestId: string,
  url: string,
  options: RequestInit,
  retries: number,
): Promise<void> {
  const permissionGranted = await browser.permissions.contains({ origins: [url] });
  if (!permissionGranted) {
    sendToContent(tabId, MessageAction.FetchFailed, {
      requestId,
      message: `Competitive Companion does not have permission to request ${url}`,
    });

    return;
  }

  try {
    const content = await request(url, options, retries);
    sendToContent(tabId, MessageAction.FetchResult, { requestId, content });
  } catch (err) {
    const message = err instanceof Error ? err.message : `${err}`;
    sendToContent(tabId, MessageAction.FetchFailed, { requestId, message });
  }
}

function handleMessage(message: Message | any, sender: Runtime.MessageSender): void {
  if (!sender.tab) {
    return;
  }

  if (message.action === MessageAction.SendTask) {
    sendTask(sender.tab.id, message.payload.message);
  } else if (message.action === MessageAction.Fetch) {
    makeRequest(
      sender.tab.id,
      message.payload.requestId,
      message.payload.url,
      message.payload.options,
      message.payload.retries,
    );
  }
}

browser.browserAction.onClicked.addListener(onBrowserAction);
browser.contextMenus.onClicked.addListener(onContextMenu);
browser.runtime.onMessage.addListener(handleMessage);

createContextMenu();
