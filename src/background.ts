import type { Menus, Runtime, Tabs } from 'webextension-polyfill';
import { getHosts } from './hosts/hosts';
import { Message, MessageAction } from './models/messaging';
import { browser } from './utils/browser';
import { sendToContent } from './utils/messaging';
import { request, requiredPermissions } from './utils/request';

declare global {
  const PARSER_NAMES: string[];
}

function createContextMenu(): void {
  browser.contextMenus.create({
    id: 'parse-with',
    title: 'Parse with',
    contexts: ['action'],
  });

  browser.contextMenus.create({
    id: 'problem-parser',
    parentId: 'parse-with',
    title: 'Problem parser',
    contexts: ['action'],
  });

  browser.contextMenus.create({
    id: 'contest-parser',
    parentId: 'parse-with',
    title: 'Contest parser',
    contexts: ['action'],
  });

  for (const parser of PARSER_NAMES) {
    const isContestParser = parser.endsWith('ContestParser');

    browser.contextMenus.create({
      id: `parse-with-${parser}`,
      parentId: `${isContestParser ? 'contest' : 'problem'}-parser`,
      title: parser,
      contexts: ['action'],
    });
  }
}

async function loadContentScript(tab: Tabs.Tab, parserName: string): Promise<void> {
  const permissionOrigins: string[] = ['http://localhost/'];

  for (const prefix in requiredPermissions) {
    if (tab.url.startsWith(prefix)) {
      permissionOrigins.push(requiredPermissions[prefix]);
    }
  }

  if (permissionOrigins.length > 0) {
    await browser.permissions.request({ origins: permissionOrigins });
  }

  await browser.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    files: ['js/content.js'],
  });

  sendToContent(tab.id, MessageAction.Parse, { parserName });
}

function onAction(tab: Tabs.Tab): void {
  loadContentScript(tab, null);
}

function onContextMenu(info: Menus.OnClickData, tab: Tabs.Tab): void {
  if (info.menuItemId.toString().startsWith('parse-with-')) {
    const parserName = info.menuItemId.toString().split('parse-with-').pop();
    loadContentScript(tab, parserName);
  }
}

async function sendTask(tabId: number, messageId: string, data: string): Promise<void> {
  const permissionGranted = await browser.permissions.contains({ origins: ['http://localhost/'] });
  if (!permissionGranted) {
    sendToContent(tabId, MessageAction.SendTaskFailed, {
      messageId,
      message: 'Competitive Companion does not have permission to send problems to localhost',
    });

    return;
  }

  // Build requests to all hosts while firing them in parallel.
  const hosts = await getHosts();
  const requests = [];
  for (const host of hosts) {
    try {
      requests.push(host.send(data));
    } catch (err) {
      //
    }
  }

  // Wait for all requests to finish.
  try {
    await Promise.allSettled(requests);
  } catch (err) {
    //
  }

  try {
    sendToContent(tabId, MessageAction.SendTaskDone, { messageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : `${err}`;
    sendToContent(tabId, MessageAction.SendTaskFailed, { messageId, message });
  }
}

async function makeRequest(
  tabId: number,
  messageId: string,
  url: string,
  options: RequestInit,
  retries: number,
): Promise<void> {
  const permissionGranted = await browser.permissions.contains({ origins: [url] });
  if (!permissionGranted) {
    sendToContent(tabId, MessageAction.FetchFailed, {
      messageId,
      message: `Competitive Companion does not have permission to request ${url}`,
    });

    return;
  }

  try {
    const content = await request(url, options, retries);
    sendToContent(tabId, MessageAction.FetchResult, { messageId, content });
  } catch (err) {
    const message = err instanceof Error ? err.message : `${err}`;
    sendToContent(tabId, MessageAction.FetchFailed, { messageId, message });
  }
}

function handleMessage(message: Message | any, sender: Runtime.MessageSender): void {
  if (!sender.tab) {
    return;
  }

  if (message.action === MessageAction.SendTask) {
    sendTask(sender.tab.id, message.payload.messageId, message.payload.message);
  } else if (message.action === MessageAction.Fetch) {
    makeRequest(
      sender.tab.id,
      message.payload.messageId,
      message.payload.url,
      message.payload.options,
      message.payload.retries,
    );
  }
}

browser.action.onClicked.addListener(onAction);
browser.contextMenus.onClicked.addListener(onContextMenu);
browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(createContextMenu);
