# MiMo GitHub Repo Doctor - API Integration Guide

## 1. GitHub API Integration

### 1.1 Authentication Setup

**File: `lib/api/github.ts`**

```typescript
import { Octokit } from '@octokit/rest';
import { RequestError } from '@octokit/request-error';

export class GitHubClient {
  private octokit: Octokit;
  private rateLimitRemaining: number = 5000;
  private rateLimitReset: number = 0;

  constructor(token?: string) {
    const auth = token || process.env.GITHUB_TOKEN;
    
    if (!auth) {
      throw new Error('GitHub token not configured. Set GITHUB_TOKEN environment variable.');
    }

    this.octokit = new Octokit({
      auth,
      userAgent: 'MiMo-Repo-Doctor/1.0',
      throttle: {
        onRateLimit: (retryAfter, options, octokit) => {
          octokit.log.warn(
            `Request quota exhausted for request ${options.method} ${options.url}`
          );
          return true; // Retry after rate limit reset
        },
        onAbuseLimit: (retryAfter, options, octokit) => {
          octokit.log.warn(
            `Abuse detected for request ${options.method} ${options.url}`
          );
          return false; // Do not retry
        },
      },
    });
  }

  /**
   * Get repository metadata
   */
  async getRepository(owner: string, repo: string) {
    try {
      const response = await this.octokit.repos.get({
        owner,
        repo,
      });

      return {
        name: response.data.name,
        owner: response.data.owner.login,
        description: response.data.description || '',
        language: response.data.language || 'Unknown',
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        url: response.data.html_url,
        isPrivate: response.data.private,
        topics: response.data.topics || [],
        license: response.data.license?.name || null,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        pushedAt: response.data.pushed_at,
      };
    } catch (error) {
      if (error instanceof RequestError) {
        if (error.status === 404) {
          throw new Error(`Repository not found: ${owner}/${repo}`);
        }
        if (error.status === 403) {
          throw new Error('Repository is private or access denied');
        }
      }
      throw error;
    }
  }

  /**
   * Get README content
   */
  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      const response = await this.octokit.repos.getReadme({
        owner,
        repo,
        headers: {
          accept: 'application/vnd.github.v3.raw',
        },
      });

      return response.data as unknown as string;
    } catch (error) {
      if (error instanceof RequestError && error.status === 404) {
        return ''; // No README found
      }
      throw error;
    }
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<string | null> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        headers: {
          accept: 'application/vnd.github.v3.raw',
        },
      });

      if (Array.isArray(response.data)) {
        return null; // Path is a directory
      }

      return response.data.content as unknown as string;
    } catch (error) {
      if (error instanceof RequestError && error.status === 404) {
        return null; // File not found
      }
      throw error;
    }
  }

  /**
   * Get repository tree structure
   */
  async getRepositoryTree(
    owner: string,
    repo: string,
    recursive: boolean = false,
    maxDepth: number = 2
  ): Promise<string> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path: '',
      });

      if (!Array.isArray(response.data)) {
        return '';
      }

      return this.formatTree(response.data, '', maxDepth);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Format tree structure for display
   */
  private formatTree(
    items: any[],
    prefix: string = '',
    maxDepth: number = 2,
    currentDepth: number = 0
  ): string {
    if (currentDepth >= maxDepth) {
      return '';
    }

    const lines: string[] = [];
    const sortedItems = items.sort((a, b) => {
      // Directories first, then files
      if (a.type !== b.type) {
        return a.type === 'dir' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    sortedItems.forEach((item, index) => {
      const isLast = index === sortedItems.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = item.type === 'dir' ? '📁 ' : '📄 ';

      lines.push(`${prefix}${connector}${icon}${item.name}`);

      if (item.type === 'dir' && currentDepth < maxDepth - 1) {
        const extension = isLast ? '    ' : '│   ';
        // Note: In real implementation, would need recursive API calls
        // For now, just indicate directory
        lines.push(`${prefix}${extension}...`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Get rate limit status
   */
  async getRateLimit() {
    const response = await this.octokit.rateLimit.get();
    return {
      limit: response.data.resources.core.limit,
      remaining: response.data.resources.core.remaining,
      reset: response.data.resources.core.reset,
    };
  }
}
```

### 1.2 Error Handling

```typescript
export class GitHubError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

export function handleGitHubError(error: any): GitHubError {
  if (error instanceof RequestError) {
    const code = error.status === 404 ? 'NOT_FOUND' : 'API_ERROR';
    return new GitHubError(code, error.status, error.message);
  }
  
  if (error instanceof GitHubError) {
    return error;
  }

  return new GitHubError('UNKNOWN', 500, error.message);
}
```

## 2. MiMo API Integration

### 2.1 MiMo Client Implementation

**File: `lib/api/mimo.ts`**

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface MiMoAnalysisRequest {
  repository: {
    name: string;
    owner: string;
    description: string;
    language: string;
    stars: number;
    url: string;
  };
  readmeContent: string;
  packageJson?: Record<string, any>;
  repoTree?: string;
  errorLog?: string;
}

export interface MiMoAnalysisResponse {
  readme: {
    score: number;
    current_state: string;
    missing_elements: string[];
    improvements: Array<{
      title: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
      code_example?: string;
      impact: string;
    }>;
    suggestions: string[];
  };
  installation: {
    prerequisites: string[];
    steps: Array<{
      number: number;
      title: string;
      command: string;
      description: string;
    }>;
    environment_setup?: {
      required_vars: string[];
      example: string;
    };
    common_issues: Array<{
      issue: string;
      solution: string;
    }>;
  };
  issues: {
    critical: Array<{
      title: string;
      description: string;
      action: string;
    }>;
    important: Array<{
      title: string;
      description: string;
      action: string;
    }>;
    nice_to_have: Array<{
      title: string;
      description: string;
      action: string;
    }>;
  };
  pitch: {
    one_liner: string;
    problem_statement: string;
    solution: string;
    technical_implementation: string;
    impact: string;
    roadmap: string[];
  };
}

export class MiMoClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MIMO_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('MiMo API key not configured. Set MIMO_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: process.env.MIMO_API_URL || 'https://api.mimo.dev/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MiMo-Repo-Doctor/1.0',
      },
      timeout: 60000, // 60 second timeout for analysis
    });
  }

  /**
   * Analyze repository with MiMo AI
   */
  async analyzeRepository(
    request: MiMoAnalysisRequest
  ): Promise<MiMoAnalysisResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(request);

      const response = await this.client.post('/chat/completions', {
        model: 'mimo-analysis-v1',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(request: MiMoAnalysisRequest): string {
    return `Analyze the following GitHub repository for grant/hackathon readiness:

**Repository Information:**
- Name: ${request.repository.name}
- Owner: ${request.repository.owner}
- Description: ${request.repository.description}
- Primary Language: ${request.repository.language}
- Stars: ${request.repository.stars}
- URL: ${request.repository.url}

**README.md Content:**
\`\`\`
${request.readmeContent || '[No README found]'}
\`\`\`

${request.packageJson ? `**package.json:**
\`\`\`json
${JSON.stringify(request.packageJson, null, 2)}
\`\`\`` : ''}

${request.repoTree ? `**Repository Structure:**
\`\`\`
${request.repoTree}
\`\`\`` : ''}

${request.errorLog ? `**Error Log:**
\`\`\`
${request.errorLog}
\`\`\`` : ''}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "readme": { "score": number, "current_state": string, "missing_elements": string[], "improvements": [...], "suggestions": string[] },
  "installation": { "prerequisites": string[], "steps": [...], "environment_setup": {...}, "common_issues": [...] },
  "issues": { "critical": [...], "important": [...], "nice_to_have": [...] },
  "pitch": { "one_liner": string, "problem_statement": string, "solution": string, "technical_implementation": string, "impact": string, "roadmap": string[] }
}`;
  }

  /**
   * Get system prompt
   */
  private getSystemPrompt(): string {
    return `You are an expert GitHub repository analyst specializing in grant applications and hackathon submissions. Your role is to analyze repositories and provide actionable recommendations to improve their presentation, documentation, and grant-readiness.

You have deep expertise in:
- Technical documentation best practices
- Open source project standards
- Grant application requirements (Gitcoin, MiMo, Protocol Labs, etc.)
- Hackathon judging criteria
- Developer experience optimization
- Project presentation and storytelling

Your analysis should be:
- Specific and actionable (not generic advice)
- Prioritized by impact (critical issues first)
- Practical and implementable (with code examples)
- Encouraging yet honest (highlight strengths and gaps)

Always respond with valid JSON matching the requested structure.`;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        return new Error('MiMo API authentication failed. Check your API key.');
      }

      if (axiosError.response?.status === 429) {
        return new Error('MiMo API rate limit exceeded. Please try again later.');
      }

      if (axiosError.response?.status === 500) {
        return new Error('MiMo API server error. Please try again later.');
      }

      if (axiosError.code === 'ECONNABORTED') {
        return new Error('MiMo API request timeout. Repository may be too large.');
      }

      return new Error(`MiMo API error: ${axiosError.message}`);
    }

    return error;
  }
}
```

## 3. Groq Fallback Integration

### 3.1 Groq Client Implementation

**File: `lib/api/groq.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';

export class GroqClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('Groq API key not configured. Set GROQ_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: 'https://api.groq.com/openai/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  /**
   * Analyze repository with Groq (Llama 3.3 70B)
   */
  async analyzeRepository(request: any): Promise<any> {
    try {
      const prompt = this.buildAnalysisPrompt(request);

      const response = await this.client.post('/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 4000,
      });

      const content = response.data.choices[0].message.content;
      
      // Parse JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/({[\s\S]*})/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      return JSON.parse(content);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private buildAnalysisPrompt(request: any): string {
    // Same as MiMo
    return `Analyze the following GitHub repository for grant/hackathon readiness:

**Repository Information:**
- Name: ${request.repository.name}
- Owner: ${request.repository.owner}
- Description: ${request.repository.description}
- Primary Language: ${request.repository.language}
- Stars: ${request.repository.stars}
- URL: ${request.repository.url}

**README.md Content:**
\`\`\`
${request.readmeContent || '[No README found]'}
\`\`\`

${request.packageJson ? `**package.json:**
\`\`\`json
${JSON.stringify(request.packageJson, null, 2)}
\`\`\`` : ''}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "readme": { "score": number, "current_state": string, "missing_elements": string[], "improvements": [...], "suggestions": string[] },
  "installation": { "prerequisites": string[], "steps": [...], "environment_setup": {...}, "common_issues": [...] },
  "issues": { "critical": [...], "important": [...], "nice_to_have": [...] },
  "pitch": { "one_liner": string, "problem_statement": string, "solution": string, "technical_implementation": string, "impact": string, "roadmap": string[] }
}`;
  }

  private getSystemPrompt(): string {
    return `You are an expert GitHub repository analyst specializing in grant applications and hackathon submissions. Analyze repositories and provide actionable recommendations to improve their presentation, documentation, and grant-readiness.

Your analysis should be:
- Specific and actionable (not generic advice)
- Prioritized by impact (critical issues first)
- Practical and implementable (with code examples)
- Encouraging yet honest (highlight strengths and gaps)

Always respond with valid JSON matching the requested structure.`;
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return new Error('Groq API authentication failed.');
      }
      if (error.response?.status === 429) {
        return new Error('Groq API rate limit exceeded.');
      }
    }
    return error;
  }
}
```

## 4. Unified Analysis Service

### 4.1 Analysis Service with Fallback

**File: `lib/analysis/service.ts`**

```typescript
import { GitHubClient } from '@/lib/api/github';
import { MiMoClient, MiMoAnalysisResponse } from '@/lib/api/mimo';
import { GroqClient } from '@/lib/api/groq';
import { validateInput, parseRepositoryUrl } from './validator';

export class AnalysisService {
  private github: GitHubClient;
  private mimo: MiMoClient;
  private groq: GroqClient;

  constructor() {
    this.github = new GitHubClient();
    this.mimo = new MiMoClient();
    this.groq = new GroqClient();
  }

  /**
   * Analyze repository with fallback strategy
   */
  async analyzeRepository(
    input: string,
    inputType: 'url' | 'tree'
  ): Promise<{
    analysis: MiMoAnalysisResponse;
    provider: 'mimo' | 'groq';
    processingTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Validate input
      const validation = validateInput(input, inputType);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Parse repository
      const repoData = await parseRepositoryUrl(input);

      // Fetch repository data
      const [repoInfo, readme, packageJson] = await Promise.all([
        this.github.getRepository(repoData.owner, repoData.repo),
        this.github.getReadme(repoData.owner, repoData.repo),
        this.github.getFileContent(repoData.owner, repoData.repo, 'package.json'),
      ]);

      // Try MiMo first
      try {
        const analysis = await this.mimo.analyzeRepository({
          repository: repoInfo,
          readmeContent: readme,
          packageJson: packageJson ? JSON.parse(packageJson) : undefined,
        });

        return {
          analysis,
          provider: 'mimo',
          processingTime: Date.now() - startTime,
        };
      } catch (mimoError) {
        console.warn('MiMo analysis failed, falling back to Groq:', mimoError);

        // Fallback to Groq
        const analysis = await this.groq.analyzeRepository({
          repository: repoInfo,
          readmeContent: readme,
          packageJson: packageJson ? JSON.parse(packageJson) : undefined,
        });

        return {
          analysis,
          provider: 'groq',
          processingTime: Date.now() - startTime,
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
```

## 5. API Route Implementation

### 5.1 Analysis Endpoint

**File: `app/api/analyze/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/lib/analysis/service';
import { z } from 'zod';

const AnalyzeRequestSchema = z.object({
  input: z.string().min(1),
  inputType: z.enum(['url', 'tree']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = AnalyzeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Invalid request format',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { input, inputType } = validation.data;

    // Analyze repository
    const service = new AnalysisService();
    const result = await service.analyzeRepository(input, inputType);

    return NextResponse.json({
      status: 'success',
      analysis: result.analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        processingTime: result.processingTime,
        aiProvider: result.provider,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        status: 'error',
        error: message,
      },
      { status: 500 }
    );
  }
}
```

## 6. Caching Strategy

### 6.1 Response Cache Implementation

**File: `lib/analysis/cache.ts`**

```typescript
import crypto from 'crypto';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class AnalysisCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate cache key from input
   */
  private generateKey(input: string, inputType: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${input}:${inputType}`)
      .digest('hex');
    return `analysis:${hash}`;
  }

  /**
   * Get cached result
   */
  get(input: string, inputType: string): any | null {
    const key = this.generateKey(input, inputType);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  set(input: string, inputType: string, data: any, ttl?: number): void {
    const key = this.generateKey(input, inputType);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
      })),
    };
  }
}

// Singleton instance
export const analysisCache = new AnalysisCache();
```

---

*Document Version: 1.0*  
*Last Updated: 2026-05-23*  
*Status: Ready for Implementation*