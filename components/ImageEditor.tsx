
import React, { useState, useRef, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { ImageData } from '../types';
import { fileToImageData } from '../utils/fileUtils';
import Button from './common/Button';
import Spinner from './common/Spinner';

const PresetPrompts: React.FC<{ onSelect: (prompt: string) => void }> = ({ onSelect }) => {
  const presets = [
    { label: 'Remove BG', prompt: 'Remove the background, make it transparent.' },
    { label: 'Cartoonify', prompt: 'Turn this image into a cartoon style.' },
    { label: 'Add Sunglasses', prompt: 'Add cool sunglasses to the main subject.' },
    { label: 'Make it Snow', prompt: 'Add falling snow to the image to make it look like a winter scene.' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 my-4">
      {presets.map(p => (
        <button
          key={p.label}
          onClick={() => onSelect(p.prompt)}
          className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-full hover:bg-gray-600 transition-colors"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string; data: ImageData } | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditedImageUrl(null);
      setError(null);
      try {
        const imageData = await fileToImageData(file);
        setOriginalImage({
          file,
          url: URL.createObjectURL(file),
          data: imageData
        });
      } catch (err) {
        setError("Could not process file. Please try another image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage || !prompt.trim()) {
      setError("Please upload an image and provide an editing instruction.");
      return;
    }
    setLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const url = await editImage(prompt, originalImage.data);
      setEditedImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Side */}
        <div className="flex flex-col items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div 
            className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:border-gray-500 transition-colors cursor-pointer"
            onClick={triggerFileSelect}
          >
            {originalImage ? (
              <img src={originalImage.url} alt="Original" className="max-w-full max-h-full object-contain rounded-md" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="mt-2">Click to upload an image</p>
              </>
            )}
          </div>
          {originalImage && (
            <form onSubmit={handleSubmit} className="w-full mt-4">
              <div className="flex flex-col space-y-4">
                <label htmlFor="edit-prompt" className="text-lg font-semibold text-gray-200">
                  How should I edit it?
                </label>
                <PresetPrompts onSelect={(p) => setPrompt(p)} />
                <textarea
                  id="edit-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Add a birthday hat on the person"
                  className="w-full h-24 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={3}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Editing...' : 'Apply Edit'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Output Side */}
        <div className="w-full h-full min-h-[300px] bg-gray-900/50 rounded-lg flex items-center justify-center p-4">
          {loading && <Spinner />}
          {error && !loading && <p className="text-red-400 text-center">{error}</p>}
          {editedImageUrl && (
             <div className="w-full text-center">
              <img src={editedImageUrl} alt="Edited" className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg" />
              <a 
                href={editedImageUrl} 
                download={`ai-edited-${Date.now()}.png`} 
                className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Download Edited Image
              </a>
            </div>
          )}
          {!loading && !error && !editedImageUrl && (
            <p className="text-gray-500 text-center">Your edited image will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
