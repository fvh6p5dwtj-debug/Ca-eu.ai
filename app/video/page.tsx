'use client';

import { useState } from 'react';
import { ArrowLeft, Play, Video, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function VideoPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <header className="border-b border-purple-500/20 bg-[#0a0a1a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-400 hover:text-fuchsia-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                AI Video Generation
              </h1>
              <p className="text-xs text-gray-400">Create captivating videos from text prompts</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            AI Video Generation
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Create captivating videos from text prompts using cutting-edge AI models
          </p>
        </div>

        <div className="bg-[#120a24] border border-purple-500/20 rounded-2xl p-6 space-y-5 card-glow">
          <label className="block text-sm font-medium text-purple-300">
            Describe your video
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic shot of a futuristic city at sunset with neon lights reflecting off rain-soaked streets..."
            rows={4}
            className="
              w-full px-4 py-3 rounded-xl resize-none
              bg-[#1a0a2e] border border-purple-500/20
              text-white placeholder-gray-500
              focus:outline-none focus:border-purple-500/50
              focus:shadow-lg focus:shadow-purple-500/10
              transition-all duration-200
            "
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="
              w-full py-3 rounded-xl font-semibold
              bg-gradient-to-r from-purple-500 to-fuchsia-500
              text-white
              hover:from-purple-400 hover:to-fuchsia-400
              shadow-lg shadow-purple-500/20
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Video
              </>
            )}
          </button>
        </div>

        <div className="bg-[#120a24] border border-purple-500/20 rounded-2xl overflow-hidden card-glow">
          <div className="aspect-video bg-gradient-to-br from-[#1a0a2e] to-[#0d0520] flex flex-col items-center justify-center gap-4 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#120a24] to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Play className="w-8 h-8 text-purple-400 ml-1" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-300 font-medium">Video Preview</p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Your generated video will appear here
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 border-t border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-sm">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-300 font-medium">Coming Soon</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Video generation will be available soon via RunwayML and Replicate integration. 
                  Stay tuned for high-quality AI-generated videos from your text descriptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
