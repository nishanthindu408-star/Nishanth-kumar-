import React, { useState, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import ResultsPanel from './components/ResultsPanel';
import { Character, PromptItem, GeneratedImage, AspectRatioOption } from './types';
import { generateFilename } from './utils';
import { generateImageWithGemini, checkApiKey, promptForApiKey } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [characters, setCharacters] = useState<Character[]>([
    { id: '1', name: 'Character 1', image: null, previewUrl: null, base64: null, mimeType: null, selected: true },
    { id: '2', name: 'Character 2', image: null, previewUrl: null, base64: null, mimeType: null, selected: false },
    { id: '3', name: 'Character 3', image: null, previewUrl: null, base64: null, mimeType: null, selected: false },
    { id: '4', name: 'Character 4', image: null, previewUrl: null, base64: null, mimeType: null, selected: false },
  ]);

  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9');
  const [customAspectRatio, setCustomAspectRatio] = useState<string>('');
  
  const [prompts, setPrompts] = useState<PromptItem[]>([
    { id: 'p1', text: '' },
  ]);

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiKeySet, setApiKeySet] = useState(false);

  // --- Effects ---
  useEffect(() => {
    // Check initial API Key state
    checkApiKey().then(setApiKeySet);
  }, []);

  const handleSetApiKey = async () => {
    try {
      await promptForApiKey();
      // Recheck after prompt closes (or assume success and let error handler catch it)
      const hasKey = await checkApiKey();
      setApiKeySet(hasKey);
    } catch (e) {
      console.error("Failed to set API key", e);
    }
  };

  // --- Logic ---
  const handleGenerateAll = async () => {
    // 1. Validation
    const activePrompts = prompts.filter(p => p.text.trim() !== '');
    if (activePrompts.length === 0) {
      alert("Please enter at least one prompt.");
      return;
    }
    
    // Ensure API Key
    const hasKey = await checkApiKey();
    if (!hasKey) {
        await handleSetApiKey();
        // If still no key, stop
        if (!(await checkApiKey())) return;
    } else {
        setApiKeySet(true);
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]); // Clear previous results or keep? Requirement implies batch replacement or append. Let's clear for new batch.

    const newImages: GeneratedImage[] = [];
    const total = activePrompts.length;

    // 2. Batch Processing
    for (let i = 0; i < total; i++) {
      const promptItem = activePrompts[i];
      
      try {
        const imageUrl = await generateImageWithGemini(
          promptItem.text,
          characters,
          aspectRatio,
          customAspectRatio
        );

        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          promptId: promptItem.id,
          promptText: promptItem.text,
          imageUrl: imageUrl,
          filename: generateFilename(i),
          timestamp: new Date()
        };

        newImages.push(newImage);
        
        // Update state progressively so user sees images appear
        setGeneratedImages(prev => [...prev, newImage]);
        
      } catch (error: any) {
        console.error(`Failed to generate prompt ${i + 1}:`, error);
        
        if (error.message === 'API_KEY_MISSING') {
            setApiKeySet(false);
            alert("API Key session expired or invalid. Please reconnect your key.");
            setIsGenerating(false);
            return;
        }

        // Add a placeholder error image or skip? 
        // For UX, maybe just skip or show alert, but continuing the loop is robust.
      }
      
      setProgress(((i + 1) / total) * 100);
    }

    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans text-gray-900">
      <ControlPanel 
        characters={characters}
        setCharacters={setCharacters}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        customAspectRatio={customAspectRatio}
        setCustomAspectRatio={setCustomAspectRatio}
        prompts={prompts}
        setPrompts={setPrompts}
        onGenerate={handleGenerateAll}
        isGenerating={isGenerating}
        apiKeySet={apiKeySet}
        onSetApiKey={handleSetApiKey}
      />
      <ResultsPanel 
        images={generatedImages}
        progress={progress}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default App;
