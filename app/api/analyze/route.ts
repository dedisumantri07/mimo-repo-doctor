import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface AnalysisRequest {
  url?: string;
  repoTree?: string;
}

interface RepoData {
  owner: string;
  repo: string;
  description: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  readme: string;
  packageJson: any;
  hasTests: boolean;
  hasCI: boolean;
  license: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { url, repoTree } = body;

    if (!url && !repoTree) {
      return NextResponse.json(
        { error: 'Either URL or repository tree is required' },
        { status: 400 }
      );
    }

    let repoData: Partial<RepoData> = {};

    // If URL provided, fetch from GitHub
    if (url) {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid GitHub URL' },
          { status: 400 }
        );
      }

      const [, owner, repo] = match;
      repoData = await fetchGitHubData(owner, repo);
    }

    // Analyze with AI
    const analysis = await analyzeRepository(repoData, repoTree);

    const responseData = {
      repoData,
      analysis,
    };

    console.log('Sending response:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

async function fetchGitHubData(owner: string, repo: string): Promise<RepoData> {
  try {
    // Fetch repository info
    const { data: repoInfo } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Fetch README
    let readme = '';
    try {
      const { data: readmeData } = await octokit.rest.repos.getReadme({
        owner,
        repo,
      });
      readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    } catch (e) {
      readme = 'No README found';
    }

    // Fetch package.json
    let packageJson = null;
    try {
      const { data: pkgData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'package.json',
      });
      if ('content' in pkgData) {
        packageJson = JSON.parse(
          Buffer.from(pkgData.content, 'base64').toString('utf-8')
        );
      }
    } catch (e) {
      // No package.json
    }

    // Check for tests
    let hasTests = false;
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'test',
      });
      hasTests = true;
    } catch (e) {
      try {
        await octokit.rest.repos.getContent({
          owner,
          repo,
          path: '__tests__',
        });
        hasTests = true;
      } catch (e2) {
        // No tests
      }
    }

    // Check for CI
    let hasCI = false;
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '.github/workflows',
      });
      hasCI = true;
    } catch (e) {
      // No CI
    }

    return {
      owner,
      repo,
      description: repoInfo.description || '',
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      lastUpdated: repoInfo.updated_at,
      readme,
      packageJson,
      hasTests,
      hasCI,
      license: repoInfo.license?.name || 'No license',
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
}

async function analyzeRepository(
  repoData: Partial<RepoData>,
  repoTree?: string
): Promise<any> {
  // Build analysis prompt
  const prompt = buildAnalysisPrompt(repoData, repoTree);

  // Use Groq API as primary
  try {
    console.log('Calling Groq API for analysis...');
    const groqResult = await callGroqAPI(prompt);
    console.log('Groq API analysis successful');
    return groqResult;
  } catch (error: unknown) {
    console.error('Groq API failed:', error);
    
    // If API key not configured, return mock data
    if (error instanceof Error && error.message.includes('not configured')) {
      console.log('API key not configured, returning mock data');
      return getMockAnalysis();
    }
    
    throw error;
  }
}

function getMockAnalysis(): any {
  return {
    readmeAnalysis: {
      score: 75,
      strengths: [
        'Clear project description',
        'Installation instructions provided',
        'License information included',
      ],
      improvements: [
        {
          title: 'Add Quick Start Guide',
          description: 'Include a quick start section for new users',
          priority: 'important',
          example: '## Quick Start\n\nnpm install\nnpm run dev',
        },
        {
          title: 'Add Contributing Guidelines',
          description: 'Create CONTRIBUTING.md for contributors',
          priority: 'important',
        },
      ],
    },
    installationGuide: {
      prerequisites: [
        'Node.js 18+',
        'npm or yarn',
      ],
      steps: [
        {
          number: 1,
          title: 'Clone repository',
          description: 'Clone the project from GitHub',
          command: 'git clone <repository-url>',
        },
        {
          number: 2,
          title: 'Install dependencies',
          description: 'Install required packages',
          command: 'npm install',
        },
        {
          number: 3,
          title: 'Start development',
          description: 'Run the development server',
          command: 'npm run dev',
        },
      ],
      troubleshooting: [
        {
          issue: 'Dependencies installation fails',
          solution: 'Try clearing npm cache: npm cache clean --force',
        },
      ],
    },
    issueChecklist: {
      critical: [
        'Add security policy',
        'Set up CI/CD pipeline',
      ],
      important: [
        'Add code of conduct',
        'Create issue templates',
      ],
      niceToHave: [
        'Add badges to README',
        'Create demo video',
      ],
    },
    grantPitch: {
      oneLiner: 'An innovative solution that solves real problems for developers.',
      problem: 'Developers struggle with repository optimization for grants and hackathons.',
      solution: 'Automated analysis and recommendations to improve project quality.',
      impact: 'Help developers get more grants and win more hackathons.',
      roadmap: [
        'Phase 1: Core analysis features',
        'Phase 2: AI-powered suggestions',
        'Phase 3: Community features',
      ],
    },
  };
}

function buildAnalysisPrompt(
  repoData: Partial<RepoData>,
  repoTree?: string
): string {
  return `Analyze this GitHub repository and provide comprehensive recommendations for grant submissions and hackathons.

Repository Information:
${repoData.owner ? `Owner: ${repoData.owner}/${repoData.repo}` : ''}
${repoData.description ? `Description: ${repoData.description}` : ''}
${repoData.stars !== undefined ? `Stars: ${repoData.stars}` : ''}
${repoData.license ? `License: ${repoData.license}` : ''}
${repoData.hasTests !== undefined ? `Has Tests: ${repoData.hasTests}` : ''}
${repoData.hasCI !== undefined ? `Has CI/CD: ${repoData.hasCI}` : ''}

README Content:
${repoData.readme || 'No README available'}

${repoTree ? `Repository Structure:\n${repoTree}` : ''}

Please provide a detailed analysis in the following JSON format:
{
  "readmeAnalysis": {
    "score": 0-100,
    "strengths": ["strength1", "strength2"],
    "improvements": [
      {
        "title": "Improvement title",
        "description": "Detailed description",
        "priority": "critical|important|nice-to-have",
        "example": "Code example if applicable"
      }
    ]
  },
  "installationGuide": {
    "prerequisites": ["prerequisite1", "prerequisite2"],
    "steps": [
      {
        "number": 1,
        "title": "Step title",
        "description": "Step description",
        "command": "command to run"
      }
    ],
    "troubleshooting": [
      {
        "issue": "Common issue",
        "solution": "How to fix"
      }
    ]
  },
  "issueChecklist": {
    "critical": ["issue1", "issue2"],
    "important": ["issue1", "issue2"],
    "niceToHave": ["issue1", "issue2"]
  },
  "grantPitch": {
    "oneLiner": "One sentence pitch",
    "problem": "Problem statement",
    "solution": "Solution description",
    "impact": "Expected impact",
    "roadmap": ["milestone1", "milestone2"]
  }
}`;
}



async function callGroqAPI(prompt: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.includes('xxxx')) {
    throw new Error('Groq API key not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return JSON.parse(content);
}
