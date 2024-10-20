/* eslint-disable @typescript-eslint/no-non-null-assertion */
import browser from 'webextension-polyfill';
import store from '../shared/counter/store';
import { promptsData } from '../data/prompts';

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

  browser.contextMenus.create({
    id: 'promptsMenu',
    title: 'Prompts',
    contexts: ['editable'], // Show only when right-clicking input/textarea
  });

  promptsData.prompts.forEach((prompt) => {
    browser.contextMenus.create({
      id: prompt.name,
      title: prompt.name,
      parentId: 'promptsMenu',
      contexts: ['editable'],
    });
  });
});

// Handle menu item click
browser.contextMenus.onClicked.addListener((info, tab) => {
  const prompt = promptsData.prompts.find((p) => p.name === info.menuItemId);
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
