import React, { useState, useRef } from 'react';
import { generateImage } from '../services/geminiService';
import { AspectRatio, ImageData } from '../types';
import { fileToImageData } from '../utils/fileUtils';
import Button from './common/Button';

interface ImageGeneratorProps {
  onGenerate: (generateFn: () => Promise<string[]>) => Promise<void>;
  loading: boolean;
}

const AspectRatioSelector: React.FC<{ selected: AspectRatio; onChange: (value: AspectRatio) => void; disabled?: boolean }> = ({ selected, onChange, disabled = false }) => {
  const aspectRatios: { value: AspectRatio; label: string; icon: React.ReactElement }[] = [
    { value: AspectRatio.PORTRAIT, label: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2" ry="2"></rect></svg> },
    { value: AspectRatio.WIDE, label: '3:4', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="16" rx="2" ry="2"></rect></svg> },
    { value: AspectRatio.SQUARE, label: '1:1', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg> },
    { value: AspectRatio.PHOTO, label: '4:3', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="6" width="16" height="12" rx="2" ry="2"></rect></svg> },
    { value: AspectRatio.LANDSCAPE, label: '16:9', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect></svg> },
  ];

  return (
    <div className="flex justify-center space-x-2 sm:space-x-3 my-4">
      {aspectRatios.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto justify-center ${
            selected === value && !disabled
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : disabled 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          aria-label={`Select ${label} aspect ratio`}
        >
          {icon}
          <span className="mt-1 sm:mt-0">{label}</span>
        </button>
      ))}
    </div>
  );
};

const NumberOfImagesSelector: React.FC<{ selected: number; onChange: (value: number) => void; disabled?: boolean }> = ({ selected, onChange, disabled = false }) => {
    const options = [1, 2, 4];
    const isCustomSelected = !options.includes(selected);

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            onChange(1);
            return;
        }
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 8) {
            onChange(numValue);
        }
    };
    
    return (
        <div className="flex flex-wrap items-center gap-2 my-4">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    disabled={disabled}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
                        selected === option && !disabled ? 'bg-blue-600 text-white shadow-lg scale-105' : disabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {option}
                </button>
            ))}
            <div className="relative">
                 <input
                    type="number"
                    min="1"
                    max="8"
                    value={isCustomSelected ? selected : ''}
                    onChange={handleCustomChange}
                    onFocus={() => { if (!isCustomSelected) onChange(3); }}
                    placeholder="Custom"
                    aria-label="Custom number of images"
                    disabled={disabled}
                    className={`w-28 px-3 py-2 rounded-lg bg-gray-900 border-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                       isCustomSelected && !disabled ? 'border-blue-600' : 'border-gray-700'
                    } ${disabled ? 'cursor-not-allowed bg-gray-800' : ''}`}
                />
            </div>
        </div>
    );
};


const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onGenerate, loading }) => {
  const [prompt, setPrompt] = useState<string>('A photorealistic image of a majestic lion in the savanna at sunset, detailed fur, warm lighting');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<{ file: File; data: ImageData }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasReferenceImages = referenceImages.length > 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        // FIX: Refactored to use a for...of loop to avoid a potential type inference issue
        // with Array.from().map() on a FileList, which caused the 'file' parameter to be
        // inferred as 'unknown'. This ensures 'file' is correctly typed as 'File'.
        const newImagePromises = [];
        for (const file of files) {
          newImagePromises.push(
            (async () => {
              const data = await fileToImageData(file);
              return { file, data };
            })()
          );
        }
        const newImages = await Promise.all(newImagePromises);
        setReferenceImages(prev => [...prev, ...newImages]);
      } catch (error) {
        setPromptError("Could not process one or more images. Please try again.");
      }
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setPromptError("Prompt cannot be empty.");
      return;
    }
    setPromptError(null);
    const imageData = hasReferenceImages ? referenceImages.map(img => img.data) : undefined;
    const effectiveNumberOfImages = hasReferenceImages ? 1 : numberOfImages;
    await onGenerate(() => generateImage(prompt, aspectRatio, effectiveNumberOfImages, imageData));
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl h-full">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow">
          <label htmlFor="prompt" className="text-lg font-semibold text-gray-200">
            Describe the image you want to create
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., An astronaut riding a horse on Mars, digital art"
            className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mt-2"
            rows={4}
          />
          {promptError && <p className="text-red-400 mt-1 text-sm">{promptError}</p>}
          
          <div className="mt-4">
            <label className="text-lg font-semibold text-gray-200">Reference Images (Optional)</label>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
            />
            <div
                className="mt-2 w-full h-24 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:border-gray-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Upload reference images"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="text-sm mt-1">Click to upload references</p>
            </div>
            {hasReferenceImages && (
                <div className="mt-3 flex flex-wrap gap-3">
                    {referenceImages.map((image, index) => (
                        <div key={`${image.file.name}-${index}`} className="relative group">
                            <img src={URL.createObjectURL(image.file)} alt={`reference ${index + 1}`} className="h-24 w-24 object-cover rounded-md shadow-md" />
                            <button 
                              type="button"
                              onClick={() => removeReferenceImage(index)} 
                              className="absolute top-0 right-0 -m-1.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                              aria-label={`Remove reference image ${index + 1}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className={`mt-4 transition-opacity ${hasReferenceImages ? 'opacity-50' : 'opacity-100'}`}>
            <label className="text-lg font-semibold text-gray-200">Aspect Ratio</label>
            {hasReferenceImages && <p className="text-xs text-gray-500 -mt-1 mb-1">Not applicable when using reference images.</p>}
            <AspectRatioSelector selected={aspectRatio} onChange={setAspectRatio} disabled={hasReferenceImages} />
          </div>

          <div className={`mt-4 transition-opacity ${hasReferenceImages ? 'opacity-50' : 'opacity-100'}`}>
            <label className="text-lg font-semibold text-gray-200">Number of Images</label>
             {hasReferenceImages && <p className="text-xs text-gray-500 -mt-1 mb-1">Generates 1 image when using references.</p>}
            <NumberOfImagesSelector selected={numberOfImages} onChange={setNumberOfImages} disabled={hasReferenceImages} />
          </div>

        </div>
        <div className="mt-auto pt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ImageGenerator;