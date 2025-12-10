import React, { useState } from 'react';
import { Download, Eye, X } from 'lucide-react';
import { GeneratedImage } from '../types';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

interface ResultsPanelProps {
  images: GeneratedImage[];
  progress: number;
  isGenerating: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, progress, isGenerating }) => {
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);

  const saveFile = (data: Blob | string, filename: string) => {
    // Handle cases where FileSaver is the function itself (default export) or an object with saveAs
    // In many ESM builds, FileSaver is the default export function.
    // In others, it might be an object with saveAs.
    // File-saver 2.0.5 usually exports the function as default, and that function has a .saveAs property too.
    const saver = (FileSaver as any).saveAs || FileSaver;
    saver(data, filename);
  };

  const handleDownloadSingle = (image: GeneratedImage) => {
    saveFile(image.imageUrl, image.filename);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder("SriTech_Tool_Images");

    // We need to fetch the blob from the data url
    const promises = images.map(async (img) => {
        const response = await fetch(img.imageUrl);
        const blob = await response.blob();
        folder?.file(img.filename, blob);
    });

    await Promise.all(promises);
    
    const content = await zip.generateAsync({ type: "blob" });
    saveFile(content, `SriTech_Batch_${new Date().toISOString().split('T')[0]}.zip`);
  };

  return (
    <div className="flex-grow bg-white h-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generated Results</h2>
            <p className="text-gray-500 text-sm mt-1">
              {images.length > 0 ? `${images.length} images ready` : 'Waiting for generation...'}
            </p>
          </div>
          
          {images.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <Download size={18} />
              Download All
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isGenerating && (
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-6 text-center animate-pulse">
                <p className="text-blue-800 font-medium mb-3">Generating 4K Masterpieces...</p>
                <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-blue-500 mt-2">{Math.round(progress)}% Complete</p>
            </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !isGenerating && (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl m-4">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Eye size={40} className="opacity-20" />
            </div>
            <p className="text-lg font-medium text-gray-400">No images generated yet</p>
            <p className="text-sm">Configure your prompts on the left and hit Generate</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-12">
          {images.map((img) => (
            <div key={img.id} className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gray-200">
                <img src={img.imageUrl} alt={img.promptText} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                   <button 
                      onClick={() => setPreviewImage(img)}
                      className="bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition-all transform hover:scale-110"
                      title="Preview"
                   >
                     <Eye size={20} />
                   </button>
                   <button 
                      onClick={() => handleDownloadSingle(img)}
                      className="bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition-all transform hover:scale-110"
                      title="Download"
                   >
                     <Download size={20} />
                   </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 flex flex-col gap-2">
                <p className="text-xs font-mono text-gray-400">{img.filename}</p>
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed" title={img.promptText}>
                  {img.promptText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <img 
              src={previewImage.imageUrl} 
              alt="Full Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-6 text-white text-center">
               <p className="text-lg font-medium mb-2">{previewImage.filename}</p>
               <p className="text-gray-300 max-w-2xl">{previewImage.promptText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;