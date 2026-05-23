'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertCircle, Star, GitFork, Calendar, 
  Copy, Download, ArrowLeft, ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalysisResult {
  repoData?: {
    owner: string;
    repo: string;
    description: string;
    stars: number;
    forks: number;
    lastUpdated: string;
    license: string;
    hasTests: boolean;
    hasCI: boolean;
  };
  analysis?: {
    readmeAnalysis: {
      score: number;
      strengths: string[];
      improvements: Array<{
        title: string;
        description: string;
        priority: 'critical' | 'important' | 'nice-to-have';
        example?: string;
      }>;
    };
    installationGuide: {
      prerequisites: string[];
      steps: Array<{
        number: number;
        title: string;
        description: string;
        command?: string;
      }>;
      troubleshooting: Array<{
        issue: string;
        solution: string;
      }>;
    };
    issueChecklist: {
      critical: string[];
      important: string[];
      niceToHave: string[];
    };
    grantPitch: {
      oneLiner: string;
      problem: string;
      solution: string;
      impact: string;
      roadmap: string[];
    };
  };
}

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'readme' | 'install' | 'issues' | 'grant'>('readme');

  const getMockData = (): AnalysisResult => {
    return {
      repoData: {
        owner: 'vercel',
        repo: 'next.js',
        description: 'The React Framework for Production',
        stars: 120000,
        forks: 25000,
        lastUpdated: new Date().toISOString(),
        license: 'MIT',
        hasTests: true,
        hasCI: true,
      },
      analysis: {
        readmeAnalysis: {
          score: 85,
          strengths: [
            'Clear project description and purpose',
            'Comprehensive installation instructions',
            'Well-organized documentation structure',
            'Active community and contribution guidelines',
          ],
          improvements: [
            {
              title: 'Add Quick Start Section',
              description: 'Include a quick start guide at the top of README for new users to get started in under 5 minutes.',
              priority: 'important',
              example: '## Quick Start\n\nnpx create-next-app@latest\ncd my-app\nnpm run dev',
            },
            {
              title: 'Add Troubleshooting Section',
              description: 'Create a dedicated troubleshooting section for common issues and their solutions.',
              priority: 'nice-to-have',
            },
          ],
        },
        installationGuide: {
          prerequisites: [
            'Node.js 18.17 or later',
            'macOS, Windows, or Linux',
            'npm or yarn package manager',
          ],
          steps: [
            {
              number: 1,
              title: 'Create a new Next.js app',
              description: 'Use create-next-app to bootstrap a new project',
              command: 'npx create-next-app@latest my-app',
            },
            {
              number: 2,
              title: 'Navigate to project directory',
              description: 'Change into the newly created project folder',
              command: 'cd my-app',
            },
            {
              number: 3,
              title: 'Start development server',
              description: 'Run the development server to see your app',
              command: 'npm run dev',
            },
          ],
          troubleshooting: [
            {
              issue: 'Port 3000 already in use',
              solution: 'Change the port by running: PORT=3001 npm run dev',
            },
          ],
        },
        issueChecklist: {
          critical: [
            'Add security policy (SECURITY.md)',
            'Set up automated dependency updates',
          ],
          important: [
            'Add code of conduct',
            'Create issue templates',
            'Add pull request template',
          ],
          niceToHave: [
            'Add badges to README',
            'Create demo GIF or video',
            'Add architecture diagram',
          ],
        },
        grantPitch: {
          oneLiner: 'The React Framework that enables production-grade applications with zero configuration.',
          problem: 'Building production-ready React applications requires complex configuration, optimization, and infrastructure setup.',
          solution: 'Next.js provides a complete framework with built-in routing, server-side rendering, static generation, and API routes out of the box.',
          impact: 'Enables developers to build faster, more performant web applications while reducing development time by 50%.',
          roadmap: [
            'Q1: Improve build performance by 30%',
            'Q2: Add native TypeScript support',
            'Q3: Enhance image optimization',
            'Q4: Launch edge runtime features',
          ],
        },
      },
    };
  };

  useEffect(() => {
    // Try to get data from sessionStorage first
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Loaded from sessionStorage:', parsed);
        setResult(parsed);
      } catch (e) {
        console.error('Failed to parse stored result:', e);
      }
    } else {
      // If no sessionStorage, check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const mockData = urlParams.get('mock');
      
      if (mockData === 'true') {
        // Load mock data for testing
        console.log('Loading mock data for testing');
        setResult(getMockData());
      } else {
        console.log('No analysis data found in sessionStorage or URL');
      }
    }
    setLoading(false);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!result) {
      return;
    }
    
    const content = generateMarkdown(result);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.repoData?.owner}-${result.repoData?.repo}-analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded as markdown!');
  };

  const generateMarkdown = (data: AnalysisResult): string => {
    const { repoData, analysis } = data;
    let markdown = `# ${repoData?.owner}/${repoData?.repo} - Analysis Report\n\n`;
    
    if (repoData) {
      markdown += `## Repository Information\n`;
      markdown += `- **Description:** ${repoData.description}\n`;
      markdown += `- **Stars:** ${repoData.stars} ⭐\n`;
      markdown += `- **Forks:** ${repoData.forks} 🍴\n`;
      markdown += `- **Last Updated:** ${new Date(repoData.lastUpdated).toLocaleDateString()}\n`;
      markdown += `- **License:** ${repoData.license}\n`;
      markdown += `- **Has Tests:** ${repoData.hasTests ? '✅' : '❌'}\n`;
      markdown += `- **Has CI/CD:** ${repoData.hasCI ? '✅' : '❌'}\n\n`;
    }

    if (analysis) {
      markdown += `## README Analysis (Score: ${analysis.readmeAnalysis.score}/100)\n\n`;
      markdown += `### Strengths\n`;
      analysis.readmeAnalysis.strengths.forEach(s => markdown += `- ${s}\n`);
      
      markdown += `\n### Improvements\n`;
      analysis.readmeAnalysis.improvements.forEach(imp => {
        markdown += `#### ${imp.title} (${imp.priority})\n`;
        markdown += `${imp.description}\n`;
        if (imp.example) {
          markdown += `\`\`\`\n${imp.example}\n\`\`\`\n`;
        }
        markdown += `\n`;
      });

      markdown += `## Installation Guide\n\n`;
      markdown += `### Prerequisites\n`;
      analysis.installationGuide.prerequisites.forEach(p => markdown += `- ${p}\n`);
      
      markdown += `\n### Steps\n`;
      analysis.installationGuide.steps.forEach(step => {
        markdown += `${step.number}. **${step.title}**\n`;
        markdown += `   ${step.description}\n`;
        if (step.command) {
          markdown += `   \`\`\`bash\n   ${step.command}\n   \`\`\`\n`;
        }
      });

      markdown += `\n## Issue Checklist\n\n`;
      markdown += `### Critical Issues\n`;
      analysis.issueChecklist.critical.forEach(issue => markdown += `- 🔴 ${issue}\n`);
      
      markdown += `\n### Important Improvements\n`;
      analysis.issueChecklist.important.forEach(issue => markdown += `- 🟡 ${issue}\n`);
      
      markdown += `\n### Nice-to-Have Features\n`;
      analysis.issueChecklist.niceToHave.forEach(issue => markdown += `- 🟢 ${issue}\n`);

      markdown += `\n## Grant Pitch\n\n`;
      markdown += `### One-Liner\n${analysis.grantPitch.oneLiner}\n\n`;
      markdown += `### Problem Statement\n${analysis.grantPitch.problem}\n\n`;
      markdown += `### Solution\n${analysis.grantPitch.solution}\n\n`;
      markdown += `### Impact\n${analysis.grantPitch.impact}\n\n`;
      markdown += `### Roadmap\n`;
      analysis.grantPitch.roadmap.forEach((item, i) => markdown += `${i + 1}. ${item}\n`);
    }

    markdown += `\n---\n*Generated by MiMo GitHub Repo Doctor on ${new Date().toLocaleDateString()}*`;
    return markdown;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Analysis Found</h2>
          <p className="text-slate-400 mb-6">Please analyze a repository first</p>
          <a href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const { repoData, analysis } = result;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container-max py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition">
                <ArrowLeft className="w-4 h-4" />
                Back
              </a>
              <h1 className="text-xl font-bold gradient-text">Analysis Results</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => handleCopy(generateMarkdown(result))}
                className="btn-primary flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-max py-8">
        {/* Repository Info */}
        {repoData && (
          <div className="card mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {repoData.owner}/{repoData.repo}
                </h2>
                <p className="text-slate-400 mb-4">{repoData.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Star className="w-4 h-4" />
                    <span>{repoData.stars} stars</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <GitFork className="w-4 h-4" />
                    <span>{repoData.forks} forks</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {new Date(repoData.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="badge badge-info">
                    {repoData.license}
                  </div>
                  {repoData.hasTests && (
                    <div className="badge badge-success">Has Tests</div>
                  )}
                  {repoData.hasCI && (
                    <div className="badge badge-success">Has CI/CD</div>
                  )}
                </div>
              </div>
              <a
                href={`https://github.com/${repoData.owner}/${repoData.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2"
              >
                View on GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Analysis Tabs */}
        <div className="flex border-b border-slate-700 mb-8">
          {[
            { id: 'readme', label: 'README Analysis', icon: '📝' },
            { id: 'install', label: 'Installation Guide', icon: '🚀' },
            { id: 'issues', label: 'Issue Checklist', icon: '✅' },
            { id: 'grant', label: 'Grant Pitch', icon: '💰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Analysis Content */}
        {analysis && (
          <div className="animate-fade-in">
            {activeTab === 'readme' && (
              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">README Quality Score</h3>
                    <div className="text-4xl font-bold gradient-text">
                      {analysis.readmeAnalysis.score}/100
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {analysis.readmeAnalysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-300">
                          <CheckCircle className="w-4 h-4 text-success-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3">Improvements</h4>
                    <div className="space-y-4">
                      {analysis.readmeAnalysis.improvements.map((imp, i) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{imp.title}</h5>
                            <span className={`badge ${
                              imp.priority === 'critical' ? 'badge-error' :
                              imp.priority === 'important' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {imp.priority}
                            </span>
                          </div>
                          <p className="text-slate-400 mb-3">{imp.description}</p>
                          {imp.example && (
                            <pre className="bg-slate-900 border border-slate-700 rounded p-3 text-sm overflow-x-auto">
                              {imp.example}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'install' && analysis.installationGuide && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Prerequisites</h3>
                  <ul className="space-y-2">
                    {analysis.installationGuide.prerequisites.map((prereq, i) => (
                      <li key={i} className="text-slate-300">• {prereq}</li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Installation Steps</h3>
                  <div className="space-y-4">
                    {analysis.installationGuide.steps.map((step) => (
                      <div key={step.number} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center font-bold">
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{step.title}</h4>
                          <p className="text-slate-400 mb-2">{step.description}</p>
                          {step.command && (
                            <code className="block bg-slate-900 border border-slate-700 rounded p-2 text-sm font-mono">
                              {step.command}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.installationGuide.troubleshooting.length > 0 && (
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4">Troubleshooting</h3>
                    <div className="space-y-3">
                      {analysis.installationGuide.troubleshooting.map((item, i) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                          <div className="font-medium text-slate-300">Issue: {item.issue}</div>
                          <div className="text-slate-400 mt-1">Solution: {item.solution}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'issues' && analysis.issueChecklist && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                    Critical Issues
                  </h3>
                  <ul className="space-y-2">
                    {analysis.issueChecklist.critical.map((issue, i) => (
                      <li key={i} className="text-slate-300">• {issue}</li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                    Important Improvements
                  </h3>
                  <ul className="space-y-2">
                    {analysis.issueChecklist.important.map((issue, i) => (
                      <li key={i} className="text-slate-300">• {issue}</li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    Nice-to-Have Features
                  </h3>
                  <ul className="space-y-2">
                    {analysis.issueChecklist.niceToHave.map((issue, i) => (
                      <li key={i} className="text-slate-300">• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'grant' && analysis.grantPitch && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">One-Line Pitch</h3>
                  <p className="text-lg text-slate-300 italic">&quot;{analysis.grantPitch.oneLiner}&quot;</p>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Problem Statement</h3>
                  <p className="text-slate-300">{analysis.grantPitch.problem}</p>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Solution</h3>
                  <p className="text-slate-300">{analysis.grantPitch.solution}</p>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Impact</h3>
                  <p className="text-slate-300">{analysis.grantPitch.impact}</p>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Roadmap</h3>
                  <ol className="space-y-2">
                    {analysis.grantPitch.roadmap.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center text-sm">
                          {i + 1}
                        </div>
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-12">
        <div className="container-max text-center text-slate-400">
          <p>Analysis generated by MiMo GitHub Repo Doctor • {new Date().toLocaleDateString()}</p>
        </div>
      </footer>
    </div>
  );
}
