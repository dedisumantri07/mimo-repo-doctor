# MiMo GitHub Repo Doctor - Technical Architecture

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages:                                                   │   │
│  │  • / (Landing)                                            │   │
│  │  • /analyze (Loading state)                               │   │
│  │  • /results (Results with tabs)                           │   │
│  │  • /api/analyze (API endpoint)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  POST /api/analyze                                        │   │
│  │  • Validate input (URL or tree)                           │   │
│  │  • Fetch repo data from GitHub                            │   │
│  │  • Call MiMo AI for analysis                              │   │
│  │  • Return structured results                              │   │
│  │                                                            │   │
│  │  GET /api/repo-preview                                    │   │
│  │  • Quick GitHub API lookup                                │   │
│  │  • Return repo metadata                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  GitHub API      │  │  MiMo API        │  │  Groq API    │   │
│  │  (repo data)     │  │  (primary AI)    │  │  (fallback)  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Project Structure

```
mimo-repo-doctor/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing page
│   ├── analyze/
│   │   └── page.tsx               # Analysis loading page
│   ├── results/
│   │   └── page.tsx               # Results page with tabs
│   └── api/
│       ├── analyze/
│       │   └── route.ts           # Main analysis endpoint
│       ├── repo-preview/
│       │   └── route.ts           # Quick repo lookup
│       └── health/
│           └── route.ts           # Health check endpoint
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx             # Reusable button component
│   │   ├── Input.tsx              # Text input component
│   │   ├── Card.tsx               # Card wrapper
│   │   ├── Badge.tsx              # Status badge
│   │   ├── Tabs.tsx               # Tab navigation
│   │   ├── Spinner.tsx            # Loading spinner
│   │   ├── Toast.tsx              # Toast notifications
│   │   └── CodeBlock.tsx           # Syntax-highlighted code
│   │
│   ├── layout/
│   │   ├── Header.tsx             # Top navigation
│   │   ├── Footer.tsx             # Footer
│   │   └── Container.tsx          # Max-width wrapper
│   │
│   ├── pages/
│   │   ├── LandingHero.tsx        # Hero section
│   │   ├── FeatureCards.tsx       # Feature grid
│   │   ├── AnalysisProgress.tsx   # Progress checklist
│   │   ├── ResultsTabs.tsx        # Tab container
│   │   ├── ReadmeTab.tsx          # README improvements
│   │   ├── InstallTab.tsx         # Installation guide
│   │   ├── IssuesTab.tsx          # Issue checklist
│   │   └── PitchTab.tsx           # Grant pitch
│   │
│   └── common/
│       ├── CopyButton.tsx         # Copy to clipboard
│       ├── ExportButton.tsx       # Export options
│       └── ErrorBoundary.tsx      # Error handling
│
├── lib/
│   ├── api/
│   │   ├── github.ts              # GitHub API client
│   │   ├── mimo.ts                # MiMo API client
│   │   ├── groq.ts                # Groq API client (fallback)
│   │   └── types.ts               # API response types
│   │
│   ├── analysis/
│   │   ├── parser.ts              # Parse repo structure
│   │   ├── validator.ts           # Validate inputs
│   │   ├── formatter.ts           # Format AI responses
│   │   └── cache.ts               # Response caching
│   │
│   ├── utils/
│   │   ├── markdown.ts            # Markdown utilities
│   │   ├── string.ts              # String helpers
│   │   ├── error.ts               # Error handling
│   │   └── constants.ts           # App constants
│   │
│   └── hooks/
│       ├── useAnalysis.ts         # Analysis state hook
│       ├── useClipboard.ts        # Clipboard operations
│       └── useLocalStorage.ts     # Persistent state
│
├── styles/
│   ├── globals.css                # Global styles
│   ├── tailwind.config.ts         # Tailwind config
│   └── animations.css             # Custom animations
│
├── public/
│   ├── logo.svg                   # MiMo logo
│   ├── favicon.ico                # Favicon
│   └── og-image.png               # Open Graph image
│
├── .env.example                   # Environment variables template
├── .env.local                     # Local environment (git-ignored)
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── package.json                   # Dependencies
└── README.md                      # Project documentation
```

## 3. Data Flow

### 3.1 Analysis Request Flow

```
User Input (URL or Tree)
    ↓
Frontend Validation
    ↓
POST /api/analyze
    ↓
┌─────────────────────────────────────────┐
│ Backend Processing:                     │
│ 1. Parse input (URL or tree)            │
│ 2. Fetch from GitHub API                │
│ 3. Extract key files (README, pkg.json) │
│ 4. Prepare prompt for AI                │
│ 5. Call MiMo API                        │
│ 6. Fallback to Groq if needed           │
│ 7. Parse AI response                    │
│ 8. Format results                       │
│ 9. Cache response                       │
└─────────────────────────────────────────┘
    ↓
Return Structured JSON
    ↓
Frontend Renders Results
    ↓
Display in Tabs
```

### 3.2 Response Structure

```typescript
interface AnalysisResult {
  status: 'success' | 'error';
  repository: {
    name: string;
    url: string;
    description: string;
    language: string;
    stars: number;
  };
  analysis: {
    readme: {
      score: number;
      current: string;
      improvements: Improvement[];
      suggestions: string[];
    };
    installation: {
      prerequisites: string[];
      steps: InstallStep[];
      commonIssues: Issue[];
    };
    issues: {
      critical: ChecklistItem[];
      important: ChecklistItem[];
      niceToHave: ChecklistItem[];
    };
    pitch: {
      oneLiner: string;
      problemStatement: string;
      solution: string;
      technicalImpl: string;
      impact: string;
      roadmap: string[];
    };
  };
  metadata: {
    analyzedAt: string;
    processingTime: number;
    aiProvider: 'mimo' | 'groq';
  };
}
```

## 4. API Endpoints

### 4.1 POST /api/analyze

**Request:**
```json
{
  "input": "https://github.com/user/repo",
  "inputType": "url" | "tree",
  "includeErrorLog": false
}
```

**Response (200):**
```json
{
  "status": "success",
  "repository": { ... },
  "analysis": { ... },
  "metadata": { ... }
}
```

**Response (400):**
```json
{
  "status": "error",
  "error": "Invalid GitHub URL",
  "suggestion": "Use format: https://github.com/username/repo"
}
```

**Response (429):**
```json
{
  "status": "error",
  "error": "Rate limit exceeded",
  "retryAfter": 3600
}
```

### 4.2 GET /api/repo-preview?url=...

**Response (200):**
```json
{
  "name": "repo-name",
  "owner": "username",
  "description": "Project description",
  "language": "TypeScript",
  "stars": 1234,
  "isPrivate": false,
  "isValid": true
}
```

### 4.3 GET /api/health

**Response (200):**
```json
{
  "status": "ok",
  "services": {
    "github": "ok",
    "mimo": "ok",
    "groq": "ok"
  }
}
```

## 5. Environment Variables

```env
# GitHub API
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_API_URL=https://api.github.com

# MiMo API
MIMO_API_KEY=mimo_xxxxxxxxxxxxxxxxxxxx
MIMO_API_URL=https://api.mimo.dev

# Groq API (Fallback)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_API_URL=https://api.groq.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=
CACHE_TTL=3600
MAX_REPO_SIZE=50000
```

## 6. Key Libraries & Dependencies

### 6.1 Core
- **next**: 14.0.0+ - React framework
- **react**: 18.2.0+ - UI library
- **typescript**: 5.0+ - Type safety

### 6.2 Styling
- **tailwindcss**: 3.3.0+ - Utility CSS
- **@tailwindcss/typography**: Markdown styling
- **clsx**: Class name utilities

### 6.3 API & Data
- **octokit/rest**: GitHub API client
- **axios**: HTTP client
- **zod**: Schema validation

### 6.4 UI Components
- **react-markdown**: Markdown rendering
- **react-syntax-highlighter**: Code highlighting
- **lucide-react**: Icon library
- **react-hot-toast**: Toast notifications

### 6.5 Utilities
- **date-fns**: Date formatting
- **lodash-es**: Utility functions
- **js-cookie**: Cookie management

### 6.6 Development
- **eslint**: Code linting
- **prettier**: Code formatting
- **@types/node**: Node.js types
- **@types/react**: React types

## 7. Authentication & Security

### 7.1 GitHub API Authentication
- Use Personal Access Token (PAT)
- Store in `GITHUB_TOKEN` environment variable
- Scope: `public_repo` (read-only)
- Rate limit: 5,000 requests/hour

### 7.2 API Key Management
- Store all keys in `.env.local` (git-ignored)
- Never commit secrets to repository
- Use `.env.example` for template
- Rotate keys quarterly

### 7.3 Input Validation
- Validate GitHub URLs with regex
- Sanitize tree input (max 50KB)
- Validate API responses with Zod
- Rate limit requests per IP

### 7.4 CORS & Security Headers
- Allow requests from app domain only
- Set CSP headers for XSS protection
- Enable HSTS for HTTPS
- Implement CSRF tokens for forms

## 8. Caching Strategy

### 8.1 Response Caching
- Cache analysis results for 24 hours
- Key: `analysis:${repoUrl}:${hash}`
- Use Redis or in-memory cache
- Invalidate on manual refresh

### 8.2 GitHub Data Caching
- Cache repo metadata for 1 hour
- Cache file contents for 6 hours
- Respect GitHub API cache headers
- Implement ETags for efficiency

### 8.3 AI Response Caching
- Cache MiMo responses for 7 days
- Cache Groq responses for 3 days
- Include AI provider in cache key
- Allow manual cache clear

## 9. Error Handling

### 9.1 Error Types

```typescript
class AnalysisError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public retryable: boolean
  ) {
    super(message);
  }
}

// Error codes:
// INVALID_URL - User input validation failed
// REPO_NOT_FOUND - GitHub API 404
// REPO_PRIVATE - Repository is private
// RATE_LIMIT - API rate limit exceeded
// AI_ERROR - MiMo/Groq API error
// NETWORK_ERROR - Network connectivity issue
// TIMEOUT - Request timeout
```

### 9.2 Fallback Strategy

```
Try MiMo API
  ↓ (on error)
Try Groq API
  ↓ (on error)
Return cached result
  ↓ (if available)
Return error to user
```

### 9.3 User-Facing Errors

- **Network Error**: "Connection failed. Please check your internet."
- **Invalid URL**: "Invalid GitHub URL. Use: github.com/username/repo"
- **Rate Limited**: "Too many requests. Try again in 1 hour."
- **AI Error**: "Analysis failed. Please try again later."

## 10. Performance Optimization

### 10.1 Frontend
- Code splitting by route
- Image optimization with Next.js Image
- CSS-in-JS minification
- Lazy load tabs content
- Debounce input validation

### 10.2 Backend
- Parallel GitHub API calls
- Stream AI responses
- Compress JSON responses
- Database query optimization
- Connection pooling

### 10.3 Deployment
- CDN for static assets
- Gzip compression
- HTTP/2 push
- Service worker caching
- Edge function optimization

## 11. Monitoring & Logging

### 11.1 Metrics
- API response time (p50, p95, p99)
- Error rate by endpoint
- Cache hit rate
- AI provider success rate
- User session duration

### 11.2 Logging
- Request/response logging
- Error stack traces
- AI API calls and responses
- GitHub API quota usage
- Performance metrics

### 11.3 Alerting
- Alert on error rate > 5%
- Alert on response time > 30s
- Alert on API quota exhaustion
- Alert on service downtime

## 12. Testing Strategy

### 12.1 Unit Tests
- API client functions
- Data parsing and validation
- Utility functions
- Component rendering

### 12.2 Integration Tests
- API endpoint flows
- GitHub API integration
- AI API integration
- Error handling paths

### 12.3 E2E Tests
- Landing page flow
- Analysis flow (URL input)
- Analysis flow (tree input)
- Results page interactions
- Export functionality

### 12.4 Test Coverage
- Target: 80%+ coverage
- Critical paths: 100%
- UI components: 70%+
- Utilities: 90%+

## 13. Deployment

### 13.1 Deployment Platform
- **Primary**: Netlify
- **Alternative**: Vercel
- **Fallback**: Railway

### 13.2 Build Process
```bash
npm run build      # Next.js build
npm run lint       # ESLint check
npm run type-check # TypeScript check
npm run test       # Run tests
```

### 13.3 Environment Setup
- Production: `.env.production`
- Staging: `.env.staging`
- Development: `.env.local`

### 13.4 CI/CD Pipeline
- GitHub Actions workflow
- Run tests on PR
- Deploy to staging on merge to develop
- Deploy to production on merge to main
- Automated rollback on failure

## 14. Scalability Considerations

### 14.1 Database (Future)
- PostgreSQL for analysis history
- Redis for caching
- Elasticsearch for search

### 14.2 Microservices (Phase 2)
- Separate AI analysis service
- GitHub data fetcher service
- Results formatter service
- Cache invalidation service

### 14.3 Load Balancing
- Multiple API instances
- Load balancer (nginx/HAProxy)
- Auto-scaling based on CPU/memory
- Queue system for long-running tasks

## 15. Roadmap

### MVP (Week 1-5)
- ✅ Landing page
- ✅ GitHub URL input
- ✅ Tree paste input
- ✅ MiMo AI integration
- ✅ Results display (4 tabs)
- ✅ Copy/export functionality
- ✅ Netlify deployment

### Phase 2 (Week 6-8)
- Batch analysis
- Custom templates
- GitHub Actions integration
- Team collaboration
- Analysis history

### Phase 3 (Week 9-12)
- Chrome extension
- VS Code extension
- CLI tool
- API for third-party
- Advanced analytics

---

*Document Version: 1.0*  
*Last Updated: 2026-05-23*  
*Status: Ready for Development*