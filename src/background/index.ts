/* eslint-disable @typescript-eslint/no-non-null-assertion */
import browser from 'webextension-polyfill';
import store from '../shared/counter/store';

store.subscribe((state) => {
  // access store state
  console.log(state);
});

// show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    //   //show the welcome page
    //   const url = browser.runtime.getURL('welcome/welcome.html');
    //   await browser.tabs.create({ url });
  }

  createContextMenu();
  // promptsData.prompts.forEach((prompt) => {
  //   browser.contextMenus.create({
  //     id: prompt.name,
  //     title: prompt.name,
  //     parentId: 'promptsMenu',
  //     contexts: ['editable'],
  //   });
  // });
});

// Create context menu items based on the prompts
const createContextMenu = async () => {
  const data = await browser.storage.sync.get('prompts');

  if (data.prompts) {
    // Clear the existing context menu
    browser.contextMenus.removeAll();

    browser.contextMenus.create({
      id: 'promptsMenu',
      title: 'Prompts',
      contexts: ['editable'], // Show only when right-clicking input/textarea
    });

    browser.contextMenus.create({
      id: 'editPrompts',
      title: 'Edit Prompts',
      contexts: ['action'], // Right-click on extension icon
    });

    // Add menu items for each prompt
    data.prompts.forEach((prompt: { name: string; content: string }) => {
      browser.contextMenus.create({
        id: prompt.name,
        title: prompt.name,
        parentId: 'promptsMenu',
        contexts: ['editable'],
      });
    });
  }
};

// Handle menu item click
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const data = await browser.storage.sync.get('prompts');

  const prompt = data.prompts.find((p: { name: string }) => p.name === info.menuItemId);
  if (prompt && tab) {
    browser.scripting.executeScript({
      target: { tabId: tab.id! },
      func: insertPrompt,
      args: [prompt.content],
    });
  }
});

// Function to inject prompt into the input box
function insertPrompt(promptContent: string) {
  const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
  if (
    activeElement &&
    (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')
  ) {
    const startPos = activeElement.selectionStart ?? 0;
    const endPos = activeElement.selectionEnd ?? activeElement.value.length;
    const textBefore = activeElement.value.substring(0, startPos);
    const textAfter = activeElement.value.substring(endPos);
    activeElement.value = `${textBefore}${promptContent}${textAfter}`;
    activeElement.selectionStart = startPos! + promptContent.length;
    activeElement.selectionEnd = startPos! + promptContent.length;
    activeElement.focus();
  }
}

// Handle menu item click
browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'editPrompts') {
    // Open the prompts page in a new tab
    browser.tabs.create({ url: browser.runtime.getURL('prompts/index.html') });
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'refreshContextMenu') {
    createContextMenu();
  }
});
