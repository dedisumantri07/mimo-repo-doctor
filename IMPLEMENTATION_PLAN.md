# MiMo GitHub Repo Doctor - Implementation Plan

## 1. Project Setup (Day 1-2)

### 1.1 Initialize Repository
```bash
# Create Next.js 14 project with TypeScript and Tailwind
npx create-next-app@latest mimo-repo-doctor --typescript --tailwind --app --no-eslint
cd mimo-repo-doctor

# Install core dependencies
npm install octokit axios zod date-fns lodash-es js-cookie
npm install react-markdown react-syntax-highlighter lucide-react react-hot-toast
npm install @types/node @types/react @types/lodash-es --save-dev

# Install development tools
npm install eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser --save-dev
```

### 1.2 Configure Environment
```bash
# Create environment files
cp .env.example .env.local

# Configure Tailwind
# Update tailwind.config.ts with custom colors and theme
```

### 1.3 Set Up Project Structure
```bash
# Create directory structure
mkdir -p components/{ui,layout,pages,common}
mkdir -p lib/{api,analysis,utils,hooks}
mkdir -p app/{analyze,results,api/{analyze,repo-preview,health}}
mkdir -p public/{icons,images}
```

## 2. Core Infrastructure (Day 3-4)

### 2.1 API Clients Implementation

**File: `lib/api/github.ts`**
```typescript
import { Octokit } from '@octokit/rest';

export class GitHubClient {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
      userAgent: 'MiMo-Repo-Doctor/1.0',
    });
  }

  async getRepository(owner: string, repo: string) {
    // Implementation
  }

  async getRepositoryContents(owner: string, repo: string, path?: string) {
    // Implementation
  }

  async getReadme(owner: string, repo: string) {
    // Implementation
  }
}
```

**File: `lib/api/mimo.ts`**
```typescript
import axios from 'axios';

export class MiMoClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.MIMO_API_URL || 'https://api.mimo.dev';
  }

  async analyzeRepository(data: AnalysisRequest): Promise<AnalysisResponse> {
    // Implementation
  }
}
```

### 2.2 Type Definitions

**File: `lib/api/types.ts`**
```typescript
export interface Repository {
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  url: string;
}

export interface AnalysisRequest {
  repository: Repository;
  readmeContent: string;
  packageJson: any;
  errorLog?: string;
}

export interface AnalysisResponse {
  readme: ReadmeAnalysis;
  installation: InstallationGuide;
  issues: IssueChecklist;
  pitch: GrantPitch;
}
```

## 3. Frontend Components (Day 5-7)

### 3.1 UI Components

**File: `components/ui/Button.tsx`**
```tsx
import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', size = 'md', loading = false, onClick }: ButtonProps) {
  // Implementation
}
```

**File: `components/ui/Input.tsx`**
```tsx
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, ...props }: InputProps) {
  // Implementation
}
```

### 3.2 Page Components

**File: `components/pages/LandingHero.tsx`**
```tsx
export function LandingHero() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold">🏥 MiMo GitHub Repo Doctor</h1>
      <p className="text-xl mt-4 text-gray-300">
        AI-powered analysis to make your repository grant-ready
      </p>
      {/* Input components */}
    </div>
  );
}
```

## 4. API Routes (Day 8-9)

### 4.1 Main Analysis Endpoint

**File: `app/api/analyze/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient } from '@/lib/api/github';
import { MiMoClient } from '@/lib/api/mimo';
import { validateInput, parseRepositoryUrl } from '@/lib/analysis/validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, inputType } = body;

    // Validate input
    const validation = validateInput(input, inputType);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Parse repository
    const repoData = await parseRepositoryUrl(input);
    
    // Fetch repository contents
    const github = new GitHubClient();
    const [readme, packageJson] = await Promise.all([
      github.getReadme(repoData.owner, repoData.repo),
      github.getFileContent(repoData.owner, repoData.repo, 'package.json'),
    ]);

    // Call MiMo AI
    const mimo = new MiMoClient();
    const analysis = await mimo.analyzeRepository({
      repository: repoData,
      readmeContent: readme,
      packageJson: packageJson,
    });

    return NextResponse.json({
      status: 'success',
      repository: repoData,
      analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        processingTime: 0, // Calculate
        aiProvider: 'mimo',
      },
    });

  } catch (error) {
    // Error handling
  }
}
```

### 4.2 Repository Preview Endpoint

**File: `app/api/repo-preview/route.ts`**
```typescript
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  // Implementation
}
```

## 5. Pages Implementation (Day 10-12)

### 5.1 Landing Page

**File: `app/page.tsx`**
```tsx
import { LandingHero } from '@/components/pages/LandingHero';
import { FeatureCards } from '@/components/pages/FeatureCards';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main>
        <LandingHero />
        <FeatureCards />
      </main>
      <Footer />
    </div>
  );
}
```

### 5.2 Analysis Page

**File: `app/analyze/page.tsx`**
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnalysisProgress } from '@/components/pages/AnalysisProgress';

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  
  const url = searchParams.get('url');
  const tree = searchParams.get('tree');

  useEffect(() => {
    // Start analysis
    const analyze = async () => {
      // API call and progress updates
    };
    analyze();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <AnalysisProgress progress={progress} />
    </div>
  );
}
```

### 5.3 Results Page

**File: `app/results/page.tsx`**
```tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResultsTabs } from '@/components/pages/ResultsTabs';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('readme');
  
  const data = searchParams.get('data'); // JSON string

  return (
    <div className="min-h-screen bg-slate-900">
      <ResultsTabs 
        data={JSON.parse(data || '{}')}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
```

## 6. Styling & Theming (Day 13)

### 6.1 Tailwind Configuration

**File: `tailwind.config.ts`**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          100: '#f1f5f9',
          400: '#94a3b8',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 3s ease infinite',
      },
    },
  },
  plugins: [],
};
export default config;
```

### 6.2 Global Styles

**File: `styles/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
  }

  body {
    @apply bg-slate-900 text-slate-100;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-slate-800 border border-slate-700 rounded-lg p-6;
  }
}
```

## 7. Testing (Day 14)

### 7.1 Unit Tests

**File: `__tests__/lib/analysis/validator.test.ts`**
```typescript
import { validateInput } from '@/lib/analysis/validator';

describe('Input Validator', () => {
  test('validates GitHub URLs', () => {
    const result = validateInput('https://github.com/user/repo', 'url');
    expect(result.valid).toBe(true);
  });

  test('rejects invalid URLs', () => {
    const result = validateInput('not-a-url', 'url');
    expect(result.valid).toBe(false);
  });
});
```

### 7.2 Integration Tests

**File: `__tests__/api/analyze.test.ts`**
```typescript
import { POST } from '@/app/api/analyze/route';

describe('Analysis API', () => {
  test('returns 400 for invalid input', async () => {
    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'invalid' }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

## 8. Deployment Preparation (Day 15)

### 8.1 Environment Setup
```bash
# Create production environment
cp .env.example .env.production

# Configure build settings
# Update next.config.ts for production
```

### 8.2 Build Optimization
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 8.3 Deployment Script
```bash
#!/bin/bash
# deploy.sh

echo "Building application..."
npm run build

echo "Running tests..."
npm run test

echo "Deploying to Netlify..."
netlify deploy --prod --dir=out
```

## 9. Development Timeline

### Week 1: Foundation
- **Day 1-2**: Project setup and configuration
- **Day 3-4**: API clients and core infrastructure
- **Day 5**: Basic UI components

### Week 2: Core Features
- **Day 6-7**: Landing page and input forms
- **Day 8-9**: API routes and analysis logic
- **Day 10**: Analysis progress page

### Week 3: Results & Polish
- **Day 11-12**: Results page with tabs
- **Day 13**: Styling and animations
- **Day 14**: Testing and bug fixes
- **Day 15**: Deployment preparation

## 10. Quality Gates

### 10.1 Code Quality
- ESLint passes with no errors
- TypeScript compiles without errors
- Test coverage > 80%
- No console errors in development

### 10.2 Performance
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size < 200KB

### 10.3 Functionality
- GitHub URL analysis works
- Tree paste analysis works
- All 4 analysis types generate output
- Copy/export functionality works
- Error handling covers all cases

## 11. Risk Mitigation

### 11.1 Technical Risks
- **MiMo API downtime**: Implement Groq fallback
- **GitHub rate limits**: Use PAT tokens, implement caching
- **Complex repository structures**: Start with common patterns
- **Large repositories**: Implement size limits, streaming

### 11.2 Development Risks
- **Scope creep**: Stick to MVP features
- **Time constraints**: Prioritize core functionality
- **Dependency issues**: Pin versions, test early
- **Browser compatibility**: Test on Chrome, Firefox, Safari

## 12. Success Criteria

### 12.1 MVP Success
- ✅ Repository analysis completes in < 30s
- ✅ All 4 analysis types produce useful output
- ✅ Users can copy/export results
- ✅ Application deploys successfully
- ✅ No critical bugs in production

### 12.2 User Success
- 100+ repositories analyzed in first month
- 80%+ users generate all four outputs
- 4/5 average user rating for usefulness
- Positive feedback from grant applicants

## 13. Post-MVP Enhancements

### 13.1 Immediate (Week 4)
- Batch analysis for multiple repos
- Custom templates for different grant types
- GitHub Actions integration
- Team collaboration features

### 13.2 Short-term (Month 2)
- Chrome extension for GitHub.com
- VS Code extension
- CLI tool for local repositories
- API for third-party integrations

### 13.3 Long-term (Month 3+)
- Advanced analytics dashboard
- AI model fine-tuning
- Community templates
- Enterprise features

---

## 14. Development Checklist

### Phase 1: Setup ✅
- [ ] Initialize Next.js project
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Set up project structure
- [ ] Configure Tailwind CSS

### Phase 2: Core Infrastructure ✅
- [ ] Implement GitHub API client
- [ ] Implement MiMo API client
- [ ] Implement Groq fallback client
- [ ] Create type definitions
- [ ] Set up validation utilities

### Phase 3: UI Components ✅
- [ ] Create reusable UI components
- [ ] Implement landing page
- [ ] Create input forms
- [ ] Build analysis progress component
- [ ] Create results tabs component

### Phase 4: API Routes ✅
- [ ] Implement /api/analyze endpoint
- [ ] Implement /api/repo-preview endpoint
- [ ] Implement /api/health endpoint
- [ ] Add error handling middleware
- [ ] Implement response caching

### Phase 5: Pages ✅
- [ ] Complete landing page
- [ ] Complete analysis page
- [ ] Complete results page
- [ ] Add navigation between pages
- [ ] Implement state management

### Phase 6: Styling & Polish ✅
- [ ] Apply consistent styling
- [ ] Add animations and transitions
- [ ] Implement dark theme
- [ ] Add responsive design
- [ ] Optimize images and assets

### Phase 7: Testing ✅
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Test error scenarios
- [ ] Test performance

### Phase 8: Deployment ✅
- [ ] Configure production environment
- [ ] Optimize build settings
- [ ] Set up CI/CD pipeline
- [ ] Deploy to Netlify
- [ ] Verify production functionality

---

*Document Version: 1.0*  
*Last Updated: 2026-05-23*  
*Status: Ready for Implementation*