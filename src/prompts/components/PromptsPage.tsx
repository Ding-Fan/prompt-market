import React, { useState } from 'react';

type Prompt = {
  name: string;
  content: string;
};

const PromptsPage: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]); // Initially empty, you can fetch saved prompts here.
  const [newPrompt, setNewPrompt] = useState<Prompt>({ name: '', content: '' });

  // Handle adding a new prompt
  const addPrompt = () => {
    setPrompts([...prompts, newPrompt]);
    setNewPrompt({ name: '', content: '' });
  };

  // Handle updating a prompt
  const updatePrompt = (index: number, updatedPrompt: Prompt) => {
    const updatedPrompts = [...prompts];
    updatedPrompts[index] = updatedPrompt;
    setPrompts(updatedPrompts);
  };

  // Handle deleting a prompt
  const deletePrompt = (index: number) => {
    const updatedPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(updatedPrompts);
  };

  return (
    <div>
      <h1>Edit Prompts</h1>

      {/* Form to add new prompt */}
      <div>
        <input
          type="text"
          placeholder="Prompt Name"
          value={newPrompt.name}
          onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
        />
        <textarea
          placeholder="Prompt Content"
          value={newPrompt.content}
          onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
        />
        <button onClick={addPrompt}>Add Prompt</button>
      </div>

      {/* List of existing prompts */}
      {prompts.map((prompt, index) => (
        <div key={index}>
          <h3>{prompt.name}</h3>
          <textarea
            value={prompt.content}
            onChange={(e) => updatePrompt(index, { ...prompt, content: e.target.value })}
          />
          <button onClick={() => deletePrompt(index)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default PromptsPage;
