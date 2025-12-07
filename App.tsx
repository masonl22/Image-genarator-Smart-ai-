import React, { useState, useCallback } from 'react';
import { Download, RefreshCw, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { generateImage } from './services/geminiService';
import { GeneratedImage, GenerationStatus } from './types';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("A festive colorful party hat with glitter and pom poms, 3d render, isolated on white background");
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setStatus(GenerationStatus.LOADING);
    setErrorMsg(null);
    
    try {
      const imageUrl = await generateImage(prompt);
      setResult({
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now()
      });
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(GenerationStatus.ERROR);
      setErrorMsg(err.message || "Failed to generate image. Please try again.");
    }
  }, [prompt]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `party-hat-${result.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Controls Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Hat</h2>
              <p className="text-slate-600">
                Describe the perfect party hat for your celebration. Be descriptive about colors, patterns, and materials.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 text-slate-900 border"
                  placeholder="e.g., A golden crown party hat with rubies..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setPrompt("A dinosaur themed party hat, green scales, cute style, 3d render")}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  🦖 Dinosaur Theme
                </button>
                <button 
                  onClick={() => setPrompt("A elegant silver and blue party hat with stars, silk texture")}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  ✨ Elegant Silver
                </button>
                <button 
                  onClick={() => setPrompt("A rainbow polka dot cone hat with a large red pom pom")}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  🌈 Rainbow Dots
                </button>
              </div>

              <Button 
                onClick={handleGenerate} 
                isLoading={status === GenerationStatus.LOADING}
                className="w-full sm:w-auto h-12 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Party Hat
              </Button>

              {status === GenerationStatus.ERROR && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div className="flex flex-col gap-6">
            <div className={`aspect-square w-full rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative bg-white transition-all duration-300 ${status === GenerationStatus.SUCCESS ? 'border-transparent shadow-xl' : 'border-slate-300'}`}>
              
              {status === GenerationStatus.LOADING ? (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <LoaderPulse />
                  </div>
                  <p className="text-slate-500 font-medium">Designing your hat...</p>
                </div>
              ) : result ? (
                <img 
                  src={result.url} 
                  alt={result.prompt} 
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="text-center text-slate-400 p-8">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="font-medium">No image generated yet</p>
                  <p className="text-sm mt-1">Enter a prompt and hit generate to see magic happen</p>
                </div>
              )}
            </div>

            {status === GenerationStatus.SUCCESS && result && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">Result Ready</h3>
                  <p className="text-sm text-slate-500 truncate max-w-[200px] sm:max-w-xs">{result.prompt}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerate} title="Regenerate">
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                  <Button onClick={handleDownload}>
                    <Download className="w-5 h-5 mr-2" />
                    Download PNG
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

const LoaderPulse = () => (
  <div className="flex gap-1">
    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
  </div>
);

export default App;
