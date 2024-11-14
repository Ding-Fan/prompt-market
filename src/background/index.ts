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

  createContextMenu();
});

// Create context menu items based on the prompts
const createContextMenu = async () => {
  const data = await browser.storage.sync.get('prompts');

  // If no prompts are stored, set the default ones
  if (!data.prompts || data.prompts.length === 0) {
    await browser.storage.sync.set({ prompts: promptsData.prompts });
  }

  // Fetch updated prompts from storage
  const updatedData = await browser.storage.sync.get('prompts');

  // Clear the existing context menu
  browser.contextMenus.removeAll();

  // Add "Add to Prompt" context menu item
  browser.contextMenus.create({
    id: 'addToPrompt',
    title: 'Add to Prompt',
    contexts: ['selection'], // Show when text is selected
  });

  browser.contextMenus.create({
    id: 'promptsMenu',
    title: 'Prompts',
    contexts: ['all'], // Show when right-clicking anywhere
  });

  browser.contextMenus.create({
    id: 'editPrompts',
    title: 'Edit Prompts',
    contexts: ['action'], // Right-click on extension icon
  });

  // Add menu items for each prompt
  updatedData.prompts.forEach((prompt: { name: string; content: string }) => {
    browser.contextMenus.create({
      id: prompt.name,
      title: prompt.name,
      parentId: 'promptsMenu',
      contexts: ['all'], // Show when right-clicking anywhere
    });
  });
};

// Handle menu item click
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'addToPrompt' && info.selectionText) {
    // Get the selected text
    const selectedText = info.selectionText.trim();

    // Generate prompt name using the first five words
    const words = selectedText.split(/\s+/).slice(0, 5);
    let promptName = words.join(' ');

    // Get existing prompts
    const data = await browser.storage.sync.get('prompts');
    const prompts = data.prompts || [];

    // Handle duplicate prompt names
    const existingNames = prompts.map((p: { name: string }) => p.name);
    let counter = 1;
    let uniqueName = promptName;

    while (existingNames.includes(uniqueName)) {
      counter += 1;
      uniqueName = `${promptName} (${counter})`;
    }

    promptName = uniqueName;

    // Create new prompt object
    const newPrompt = {
      name: promptName,
      content: selectedText,
    };

    // Add the new prompt to the prompts array
    prompts.push(newPrompt);

    // Save the updated prompts array back to storage
    await browser.storage.sync.set({ prompts });

    // Refresh the context menu to include the new prompt
    createContextMenu();

    // Optionally, notify the user that the prompt was added
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('icons/icon-48.png'),
      title: 'Prompt Added',
      message: `New prompt "${promptName}" has been added.`,
    });
  } else if (info.menuItemId === 'editPrompts') {
    // Open the prompts page in a new tab
    browser.tabs.create({ url: browser.runtime.getURL('prompts/index.html') });
  } else {
    // Handle prompt insertion
    const data = await browser.storage.sync.get('prompts');
    const prompt = data.prompts.find((p: { name: string }) => p.name === info.menuItemId);
    if (prompt && tab) {
      browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: insertPrompt,
        args: [prompt.content],
      });
    }
  }
});

// Function to inject prompt into the input box
function insertPrompt(promptContent: string) {
  // Try to find the input box on chatgpt.com
  const inputElement = document.querySelector('#prompt-textarea');
  if (inputElement) {
    const el = inputElement as HTMLDivElement;
    el.innerHTML = promptContent;
    el.dispatchEvent(new Event('input', { bubbles: true })); // Ensure React picks up the change
    el.focus();
  } else {
    console.error('Input box not found');
  }
}

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'refreshContextMenu') {
    createContextMenu();
  }
});
