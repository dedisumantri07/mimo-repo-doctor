# MiMo GitHub Repo Doctor - Deployment Guide

## 1. Environment Setup

### 1.1 Prerequisites

**System Requirements:**
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git 2.30+
- 1GB+ RAM
- 2GB+ disk space

**Development Tools:**
- VS Code or any code editor
- Git client
- Terminal/command line access

### 1.2 Local Development Setup

```bash
# Clone repository (when ready)
git clone https://github.com/username/mimo-repo-doctor.git
cd mimo-repo-doctor

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your API keys
```

### 1.3 Environment Variables

**File: `.env.local` (development)**
```env
# GitHub API
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# MiMo API
MIMO_API_KEY=mimo_xxxxxxxxxxxxxxxxxxxx
MIMO_API_URL=https://api.mimo.dev

# Groq API (Fallback)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX-X

# Cache Configuration
CACHE_TTL=86400000  # 24 hours in milliseconds
MAX_REPO_SIZE=50000 # Max characters for repository analysis
```

## 2. Development Workflow

### 2.1 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

### 2.2 Development Server

**Local Development:**
- URL: http://localhost:3000
- Hot reload enabled
- Development tools enabled
- Debug logging enabled

**Production Preview:**
```bash
npm run build
npm start
# Access at http://localhost:3000
```

## 3. Deployment Platforms

### 3.1 Netlify (Recommended)

**Why Netlify:**
- Free tier available
- Automatic HTTPS
- CDN for static assets
- Easy environment variable management
- GitHub integration for auto-deploy

**Deployment Steps:**

1. **Create Netlify Account**
   - Sign up at https://app.netlify.com
   - Connect GitHub account

2. **Configure Project**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Initialize project
   netlify init
   ```

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
   - **Node version:** `18`

4. **Set Environment Variables**
   ```bash
   # Set environment variables
   netlify env:set GITHUB_TOKEN ghp_xxxxxxxxxxxxxxxxxxxx
   netlify env:set MIMO_API_KEY mimo_xxxxxxxxxxxxxxxxxxxx
   netlify env:set GROQ_API_KEY gsk_xxxxxxxxxxxxxxxxxxxx
   netlify env:set NEXT_PUBLIC_APP_URL https://your-site.netlify.app
   ```

5. **Deploy**
   ```bash
   # Deploy to production
   netlify deploy --prod

   # Or deploy preview
   netlify deploy
   ```

**Netlify Configuration File: `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.github.com https://api.mimo.dev https://api.groq.com;"
```

### 3.2 Vercel (Alternative)

**Deployment Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add GITHUB_TOKEN
   vercel env add MIMO_API_KEY
   vercel env add GROQ_API_KEY
   ```

**Vercel Configuration File: `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://your-site.vercel.app"
  }
}
```

### 3.3 Railway (Alternative)

**Deployment Steps:**

1. **Create Railway Account**
   - Sign up at https://railway.app
   - Connect GitHub

2. **Create New Project**
   - Select "Deploy from GitHub repo"
   - Choose repository

3. **Configure Service**
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Port:** `3000`

4. **Set Environment Variables**
   - Add all required environment variables

## 4. Production Configuration

### 4.1 Production Environment File

**File: `.env.production`**
```env
# Production API keys (different from development)
GITHUB_TOKEN=ghp_production_xxxxxxxxxxxx
MIMO_API_KEY=mimo_production_xxxxxxxxxxxx
GROQ_API_KEY=gsk_production_xxxxxxxxxxxx

# Production URLs
NEXT_PUBLIC_APP_URL=https://mimo-repo-doctor.netlify.app

# Production settings
CACHE_TTL=86400000
MAX_REPO_SIZE=50000
NODE_ENV=production
```

### 4.2 Next.js Production Configuration

**File: `next.config.ts`**
```typescript
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
};

export default nextConfig;
```

### 4.3 Security Headers

**File: `middleware.ts`**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
```

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build
        run: npm run build
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MIMO_API_KEY: ${{ secrets.MIMO_API_KEY }}
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MIMO_API_KEY: ${{ secrets.MIMO_API_KEY }}
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: './out'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        timeout-minutes: 15
```

### 5.2 Environment Secrets

**GitHub Repository Secrets:**
- `GITHUB_TOKEN`: GitHub Personal Access Token
- `MIMO_API_KEY`: MiMo API key
- `GROQ_API_KEY`: Groq API key
- `NETLIFY_AUTH_TOKEN`: Netlify authentication token
- `NETLIFY_SITE_ID`: Netlify site ID

**How to set secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its value

## 6. Monitoring & Analytics

### 6.1 Application Monitoring

**File: `lib/monitoring/analytics.ts`**
```typescript
export class Analytics {
  static trackEvent(event: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${event}:`, properties);
    }
  }

  static trackAnalysis(repoUrl: string, provider: string, processingTime: number) {
    this.trackEvent('analysis_completed', {
      repo_url: repoUrl,
      ai_provider: provider,
      processing_time: processingTime,
    });
  }

  static trackError(errorType: string, errorMessage: string) {
    this.trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
    });
  }
}
```

### 6.2 Google Analytics Setup

**File: `app/layout.tsx`**
```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_ANALYTICS_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_ANALYTICS_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 6.3 Error Tracking

**File: `lib/monitoring/error.ts`**
```typescript
export class ErrorTracker {
  static capture(error: Error, context?: Record<string, any>) {
    // Send to error tracking service (e.g., Sentry)
    console.error('Error captured:', error, context);
    
    // Log to analytics
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('event', 'exception', {
        description: error.message,
        fatal: true,
        ...context,
      });
    }
  }
}
```

## 7. Performance Optimization

### 7.1 Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Or with webpack-bundle-analyzer
npx @next/bundle-analyzer
```

### 7.2 Image Optimization

```tsx
import Image from 'next/image';

// Use Next.js Image component for automatic optimization
<Image
  src="/logo.png"
  alt="MiMo Repo Doctor"
  width={120}
  height={40}
  priority
/>
```

### 7.3 Code Splitting

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const ResultsTabs = dynamic(() => import('@/components/pages/ResultsTabs'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

## 8. Database & Storage

### 8.1 Local Storage for User Preferences

```typescript
export class UserPreferences {
  static get(key: string): any {
    if (typeof window === 'undefined') return null;
    
    const value = localStorage.getItem(`mimo_${key}`);
    return value ? JSON.parse(value) : null;
  }

  static set(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(`mimo_${key}`, JSON.stringify(value));
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    
    Object.keys(localStorage)
      .filter(key => key.startsWith('mimo_'))
      .forEach(key => localStorage.removeItem(key));
  }
}
```

### 8.2 Cache Management

```typescript
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number }>();

  static set(key: string, data: any, ttl: number = 3600000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  static clear(): void {
    this.cache.clear();
  }
}
```

## 9. Backup & Recovery

### 9.1 Database Backup (Future)

```bash
# Backup script (when database is added)
#!/bin/bash
BACKUP_DIR="/backups/mimo-repo-doctor"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### 9.2 Environment Backup

```bash
# Export environment variables
env | grep -E '^(GITHUB|MIMO|GROQ|NEXT)' > .env.backup
```

## 10. Troubleshooting

### 10.1 Common Issues

**Issue: Build fails on Netlify**
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue: API calls failing**
```bash
# Check environment variables
echo $GITHUB_TOKEN
echo $MIMO_API_KEY

# Test API endpoints
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/rate_limit
```

**Issue: Memory issues**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 10.2 Debug Mode

**File: `lib/utils/debug.ts`**
```typescript
export class Debug {
  static enabled = process.env.NODE_ENV === 'development';

  static log(message: string, data?: any) {
    if (this.enabled) {
      console.log(`[Debug] ${message}`, data || '');
    }
  }

  static error(message: string, error?: any) {
    if (this.enabled) {
      console.error(`[Debug] ${message}`, error || '');
    }
  }

  static time(label: string) {
    if (this.enabled) {
      console.time(`[Debug] ${label}`);
    }
  }

  static timeEnd(label: string) {
    if (this.enabled) {
      console.timeEnd(`[Debug] ${label}`);
    }
  }
}
```

## 11. Maintenance Checklist

### Daily
- [ ] Check application logs for errors
- [ ] Monitor API rate limits
- [ ] Verify backups are running
- [ ] Check website uptime

### Weekly
- [ ] Review analytics and usage patterns
- [ ] Update dependencies (security patches)
- [ ] Test deployment pipeline
- [ ] Clear expired cache entries

### Monthly
- [ ] Rotate API keys
- [ ] Review security headers
- [ ] Update documentation
- [ ] Performance audit

## 12. Rollback Procedure

### 12.1 Netlify Rollback
```bash
# List deployments
netlify deploy:list

# Rollback to specific deployment
netlify rollback --site-id YOUR_SITE_ID --deploy-id DEPLOY_ID
```

### 12.2 Manual Rollback
```bash
# Revert to previous Git commit
git revert HEAD

# Or reset to previous commit
git reset --hard HEAD~1
git push -f origin main
```

---

*Document Version: 1.0*  
*Last Updated: 2026-05-23*  
*Status: Ready for Deployment*