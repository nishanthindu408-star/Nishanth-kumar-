export interface Character {
  id: string;
  name: string;
  image: File | null;
  previewUrl: string | null;
  base64: string | null;
  mimeType: string | null;
  selected: boolean;
}

export interface PromptItem {
  id: string;
  text: string;
}

export interface GeneratedImage {
  id: string;
  promptId: string;
  promptText: string;
  imageUrl: string;
  filename: string;
  timestamp: Date;
}

export type AspectRatioOption = '16:9' | '9:16' | '1:1' | '4:3' | 'Custom';

export interface AppState {
  characters: Character[];
  aspectRatio: AspectRatioOption;
  customAspectRatio: string;
  prompts: PromptItem[];
  isGenerating: boolean;
  progress: number; // 0 to 100
  generatedImages: GeneratedImage[];
  apiKeySet: boolean;
}
