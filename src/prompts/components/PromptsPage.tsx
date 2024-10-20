import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { promptsData } from '../../data/prompts';

// Define the structure for a prompt
type Prompt = {
  name: string;
  content: string;
};

const PromptsPage: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]); // State to hold the prompts
  const [newPrompt, setNewPrompt] = useState<Prompt>({ name: '', content: '' });

  // Function to save prompts to browser storage
  const savePromptsToStorage = async (prompts: Prompt[]) => {
    await browser.storage.sync.set({ prompts });
    console.log('Prompts saved to storage:', prompts);
    // Send a message to the background script to refresh context menu
    browser.runtime.sendMessage({ action: 'refreshContextMenu' });
  };

  // Function to load prompts from browser storage
  const loadPromptsFromStorage = async () => {
    const result = await browser.storage.sync.get(['prompts']);

    if (result.prompts) {
      setPrompts(result.prompts);
    } else {
      // If no stored data, load the initial hardcoded prompts
      setPrompts(promptsData.prompts);
    }
  };

  // Load the prompts when the component mounts
  useEffect(() => {
    loadPromptsFromStorage();
  }, []);

  // Handle adding a new prompt
  const addPrompt = () => {
    const updatedPrompts = [...prompts, newPrompt];
    setPrompts(updatedPrompts);
    savePromptsToStorage(updatedPrompts); // Save to storage
    setNewPrompt({ name: '', content: '' }); // Clear form
  };

  // Handle updating a prompt
  const updatePrompt = (index: number, updatedPrompt: Prompt) => {
    const updatedPrompts = [...prompts];
    updatedPrompts[index] = updatedPrompt;
    setPrompts(updatedPrompts);
    savePromptsToStorage(updatedPrompts); // Save to storage
  };

  // Handle deleting a prompt
  const deletePrompt = (index: number) => {
    const updatedPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(updatedPrompts);
    savePromptsToStorage(updatedPrompts); // Save to storage
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg max-w-xl">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Edit Prompts</h1>

      {/* Form to add new prompt */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Prompt Name"
          value={newPrompt.name}
          onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          placeholder="Prompt Content"
          value={newPrompt.content}
          onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
        />
        <button
          onClick={addPrompt}
          className="w-full bg-indigo-600 text-white font-semibold p-2 rounded-md hover:bg-indigo-500 transition"
        >
          Add Prompt
        </button>
      </div>

      {/* List of existing prompts */}
      {prompts.map((prompt, index) => (
        <div key={index} className="mb-6 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{prompt.name}</h3>
          <textarea
            value={prompt.content}
            onChange={(e) => updatePrompt(index, { ...prompt, content: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
          />
          <button
            onClick={() => deletePrompt(index)}
            className="w-full bg-red-600 text-white font-semibold p-2 rounded-md hover:bg-red-500 transition"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default PromptsPage;
