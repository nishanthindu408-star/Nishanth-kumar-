import React, { useRef } from 'react';
import { Plus, Trash2, Upload, Sparkles, CheckSquare, Square, Edit2 } from 'lucide-react';
import { Character, PromptItem, AspectRatioOption } from '../types';
import { fileToBase64 } from '../utils';

interface ControlPanelProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  aspectRatio: AspectRatioOption;
  setAspectRatio: (ar: AspectRatioOption) => void;
  customAspectRatio: string;
  setCustomAspectRatio: (val: string) => void;
  prompts: PromptItem[];
  setPrompts: React.Dispatch<React.SetStateAction<PromptItem[]>>;
  onGenerate: () => void;
  isGenerating: boolean;
  apiKeySet: boolean;
  onSetApiKey: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  characters,
  setCharacters,
  aspectRatio,
  setAspectRatio,
  customAspectRatio,
  setCustomAspectRatio,
  prompts,
  setPrompts,
  onGenerate,
  isGenerating,
  apiKeySet,
  onSetApiKey
}) => {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCharacterUpload = async (index: number, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      
      setCharacters(prev => {
        const newChars = [...prev];
        newChars[index] = {
          ...newChars[index],
          image: file,
          previewUrl,
          base64,
          mimeType: file.type,
          selected: true // Auto select on upload
        };
        return newChars;
      });
    } catch (e) {
      console.error("Upload failed", e);
    }
  };

  const toggleCharacterSelection = (index: number) => {
    setCharacters(prev => {
      const newChars = [...prev];
      newChars[index].selected = !newChars[index].selected;
      return newChars;
    });
  };

  const updateCharacterName = (index: number, name: string) => {
    setCharacters(prev => {
      const newChars = [...prev];
      newChars[index].name = name;
      return newChars;
    });
  };

  const addPrompt = () => {
    if (prompts.length < 10) {
      setPrompts([...prompts, { id: crypto.randomUUID(), text: '' }]);
    }
  };

  const updatePrompt = (id: string, text: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, text } : p));
  };

  const removePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const getFirstSelectedName = () => {
      const char = characters.find(c => c.selected && c.name);
      return char ? char.name : 'CharacterName';
  };

  return (
    <div className="w-full lg:w-[450px] flex-shrink-0 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto p-6 flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-yellow-500 fill-yellow-500" />
          Sri Tech Tool
        </h1>
        <p className="text-sm text-gray-500 mt-1">Consistent Character Generator</p>
      </div>

      {/* 1. Character Reference Images */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">1. Character References</h2>
        <div className="space-y-4">
          {characters.map((char, idx) => (
            <div key={char.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleCharacterSelection(idx)}
                  className={`flex-shrink-0 ${char.selected ? 'text-blue-600' : 'text-gray-300'} transition-colors`}
                  title={char.selected ? "Included in generation" : "Excluded"}
                >
                  {char.selected ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                
                <div className="flex-grow relative">
                   <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacterName(idx, e.target.value)}
                    className="w-full text-sm font-bold text-gray-800 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 p-1 focus:outline-none placeholder-gray-400 bg-transparent transition-all pr-6 rounded-t-md focus:bg-gray-50"
                    placeholder={`Name (e.g. Alice)`}
                    title="Click to edit character name"
                  />
                  <Edit2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="mt-3">
                {char.previewUrl ? (
                  <div className="relative group w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={char.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-gray-50/50"
                  >
                    <Upload size={20} className="mb-2" />
                    <span className="text-xs">Upload Image</span>
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => { fileInputRefs.current[idx] = el; }}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleCharacterUpload(idx, e.target.files[0]);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Aspect Ratio */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">2. Aspect Ratio</h2>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatioOption)}
            className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="Custom">Custom</option>
          </select>
          
          {aspectRatio === 'Custom' && (
             <input
              type="text"
              value={customAspectRatio}
              onChange={(e) => setCustomAspectRatio(e.target.value)}
              placeholder="e.g. 21:9 or Panoramic"
              className="mt-3 w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
             />
          )}
        </div>
      </section>

      {/* 3. Prompt List */}
      <section className="flex-grow">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">3. Prompts ({prompts.length}/10)</h2>
          <button 
            onClick={addPrompt}
            disabled={prompts.length >= 10}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <p className="text-xs text-gray-600 bg-blue-50 border border-blue-100 p-2.5 rounded-lg mb-4 leading-relaxed">
          <span className="font-semibold text-blue-700">Tip:</span> To ensure consistency, use the exact character names defined above in your prompts. 
          <br/>
          Ex: <em>"{getFirstSelectedName()} sitting on a bench..."</em>
        </p>

        <div className="space-y-3">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="relative group">
              <textarea
                value={prompt.text}
                onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                placeholder={`Prompt ${index + 1}...`}
                className="w-full border-gray-300 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[80px] p-3 shadow-sm resize-none"
              />
              {prompts.length > 1 && (
                <button
                  onClick={() => removePrompt(prompt.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm border border-gray-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Action Button */}
      <div className="pt-4 pb-8 sticky bottom-0 bg-gray-50 border-t border-gray-200">
        {!apiKeySet ? (
          <button
            onClick={onSetApiKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            Connect Paid API Key
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={isGenerating || prompts.some(p => !p.text.trim())}
            className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isGenerating || prompts.some(p => !p.text.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-200'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate All Images
              </>
            )}
          </button>
        )}
        
        <p className="text-xs text-center text-gray-400 mt-3">
          Powered by Gemini 3 Pro Image Preview (4K)
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;