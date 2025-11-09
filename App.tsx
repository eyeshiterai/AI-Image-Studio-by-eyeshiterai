import React, { useState } from 'react';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import Tabs from './components/common/Tabs';
import Spinner from './components/common/Spinner';

type ActiveTab = 'generate' | 'edit';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);

  const handleGenerate = async (generateFn: () => Promise<string[]>) => {
    setLoading(true);
    setError(null);
    setImageUrls(null);
    try {
      const urls = await generateFn();
      setImageUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const ResultPanel: React.FC = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl h-full flex items-center justify-center min-h-[500px] lg:min-h-0">
      <div className="text-center w-full h-full">
        {loading && <Spinner />}
        {error && <p className="text-red-400">{error}</p>}
        {imageUrls && imageUrls.length > 0 && (
          <div className="w-full h-full overflow-y-auto pr-2">
            <div className={`grid gap-4 ${imageUrls.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {imageUrls.map((url, index) => (
                <div key={index} className="group relative rounded-lg overflow-hidden">
                  <img src={url} alt={`Generated image ${index + 1}`} className="w-full h-auto object-cover rounded-lg shadow-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={url}
                      download={`ai-generated-${Date.now()}-${index + 1}.jpeg`}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-full transition-transform transform hover:scale-110"
                      aria-label="Download Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && !error && !imageUrls && <p className="text-gray-500">Your generated images will appear here.</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Tabs activeTab={activeTab} setActiveTab={(tab) => {
          setActiveTab(tab);
          // Reset state when switching tabs for a clean slate
          setImageUrls(null);
          setError(null);
          setLoading(false);
        }} />
        <div className="mt-8">
          {activeTab === 'generate' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ImageGenerator onGenerate={handleGenerate} loading={loading} />
              <ResultPanel />
            </div>
          ) : (
            <ImageEditor />
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;