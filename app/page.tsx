'use client';

import { useState } from 'react';
import { Loader2, Github, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoTree, setRepoTree] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'tree'>('url');

  const handleAnalyze = async () => {
    if (!url.trim() && !repoTree.trim()) {
      toast.error('Please enter a GitHub URL or repository tree');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting analysis with:', { url, repoTree, inputMode });
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputMode === 'url' ? url : null,
          repoTree: inputMode === 'tree' ? repoTree : null,
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Analysis failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Analysis result received:', data);
      
      toast.success('Analysis complete!');
      
      // Store result and redirect
      sessionStorage.setItem('analysisResult', JSON.stringify(data));
      console.log('Data stored in sessionStorage, redirecting...');
      window.location.href = '/results';
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze repository';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container-max py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-8 h-8 text-primary-500" />
            <h1 className="text-2xl font-bold gradient-text">MiMo Repo Doctor</h1>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-slate-200 transition">Docs</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition">GitHub</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section container-max">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Optimize Your GitHub Repository
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Get AI-powered analysis and actionable recommendations to make your project grant-ready and hackathon-worthy
          </p>
          
          {/* Input Mode Tabs */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setInputMode('url')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                inputMode === 'url'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              GitHub URL
            </button>
            <button
              onClick={() => setInputMode('tree')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                inputMode === 'tree'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Repo Tree
            </button>
          </div>

          {/* Input Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            {inputMode === 'url' ? (
              <div>
                <label className="block text-left text-sm font-medium text-slate-300 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="input w-full mb-4"
                  disabled={loading}
                />
                <p className="text-sm text-slate-400 text-left">
                  Example: https://github.com/vercel/next.js
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-left text-sm font-medium text-slate-300 mb-2">
                  Repository Tree Structure
                </label>
                <textarea
                  value={repoTree}
                  onChange={(e) => setRepoTree(e.target.value)}
                  placeholder="Paste your repository tree structure here..."
                  className="input w-full h-48 mb-4 font-mono text-sm"
                  disabled={loading}
                />
                <p className="text-sm text-slate-400 text-left">
                  Paste output from: tree -L 3 -I &apos;node_modules&apos;
                </p>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analyze Repository
              </>
            )}
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="card">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-semibold mb-2">README Analysis</h3>
            <p className="text-slate-400">
              Get quality score and specific improvement suggestions with code examples
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Installation Guide</h3>
            <p className="text-slate-400">
              Auto-generated step-by-step setup instructions with troubleshooting
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-lg font-semibold mb-2">Issue Checklist</h3>
            <p className="text-slate-400">
              Prioritized action items: critical, important, and nice-to-have
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2">Grant Pitch</h3>
            <p className="text-slate-400">
              AI-generated compelling pitch ready for grant applications
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold mb-2">Copy & Export</h3>
            <p className="text-slate-400">
              One-click copy or download results as markdown
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Fast Analysis</h3>
            <p className="text-slate-400">
              Complete analysis in 15-30 seconds powered by MiMo AI
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="container-max text-center text-slate-400">
          <p>© 2026 MiMo GitHub Repo Doctor. Open source and free to use.</p>
        </div>
      </footer>
    </div>
  );
}
