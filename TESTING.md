# MiMo GitHub Repo Doctor - Testing Strategy

## 1. Testing Framework Setup

### 1.1 Install Testing Dependencies

```bash
# Install Jest and React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @types/jest ts-jest jest-environment-jsdom

# Install additional testing utilities
npm install --save-dev msw vitest @vitest/ui
```

### 1.2 Jest Configuration

**File: `jest.config.ts`**
```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
```

### 1.3 Jest Setup File

**File: `jest.setup.ts`**
```typescript
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## 2. Unit Tests

### 2.1 API Client Tests

**File: `__tests__/lib/api/github.test.ts`**
```typescript
import { GitHubClient } from '@/lib/api/github';

describe('GitHubClient', () => {
  let client: GitHubClient;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test_token';
    client = new GitHubClient('test_token');
  });

  describe('getRepository', () => {
    it('should fetch repository metadata', async () => {
      const mockData = {
        name: 'test-repo',
        owner: { login: 'test-user' },
        description: 'Test repository',
        language: 'TypeScript',
        stargazers_count: 100,
        html_url: 'https://github.com/test-user/test-repo',
        private: false,
        topics: ['test'],
        license: { name: 'MIT' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-05-23T00:00:00Z',
        pushed_at: '2024-05-23T00:00:00Z',
        forks_count: 10,
      };

      jest.spyOn(client['octokit'].repos, 'get').mockResolvedValue({
        data: mockData,
      } as any);

      const result = await client.getRepository('test-user', 'test-repo');

      expect(result.name).toBe('test-repo');
      expect(result.owner).toBe('test-user');
      expect(result.stars).toBe(100);
    });

    it('should throw error for non-existent repository', async () => {
      jest.spyOn(client['octokit'].repos, 'get').mockRejectedValue({
        status: 404,
        message: 'Not Found',
      });

      await expect(
        client.getRepository('test-user', 'non-existent')
      ).rejects.toThrow('Repository not found');
    });

    it('should throw error for private repository', async () => {
      jest.spyOn(client['octokit'].repos, 'get').mockRejectedValue({
        status: 403,
        message: 'Forbidden',
      });

      await expect(
        client.getRepository('test-user', 'private-repo')
      ).rejects.toThrow('Repository is private');
    });
  });

  describe('getReadme', () => {
    it('should fetch README content', async () => {
      const mockReadme = '# Test Project\n\nThis is a test.';

      jest.spyOn(client['octokit'].repos, 'getReadme').mockResolvedValue({
        data: mockReadme,
      } as any);

      const result = await client.getReadme('test-user', 'test-repo');

      expect(result).toBe(mockReadme);
    });

    it('should return empty string if README not found', async () => {
      jest.spyOn(client['octokit'].repos, 'getReadme').mockRejectedValue({
        status: 404,
      });

      const result = await client.getReadme('test-user', 'test-repo');

      expect(result).toBe('');
    });
  });
});
```

### 2.2 Validation Tests

**File: `__tests__/lib/analysis/validator.test.ts`**
```typescript
import { validateInput, parseRepositoryUrl } from '@/lib/analysis/validator';

describe('Input Validator', () => {
  describe('validateInput', () => {
    it('should validate correct GitHub URL', () => {
      const result = validateInput(
        'https://github.com/user/repo',
        'url'
      );
      expect(result.valid).toBe(true);
    });

    it('should reject invalid GitHub URL', () => {
      const result = validateInput('not-a-url', 'url');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate repository tree input', () => {
      const tree = `
        repo/
        ├── src/
        ├── package.json
        └── README.md
      `;
      const result = validateInput(tree, 'tree');
      expect(result.valid).toBe(true);
    });

    it('should reject empty input', () => {
      const result = validateInput('', 'url');
      expect(result.valid).toBe(false);
    });

    it('should reject oversized input', () => {
      const largeInput = 'a'.repeat(60000);
      const result = validateInput(largeInput, 'tree');
      expect(result.valid).toBe(false);
    });
  });

  describe('parseRepositoryUrl', () => {
    it('should parse GitHub URL correctly', async () => {
      const result = await parseRepositoryUrl(
        'https://github.com/user/repo'
      );
      expect(result.owner).toBe('user');
      expect(result.repo).toBe('repo');
    });

    it('should handle URLs with trailing slash', async () => {
      const result = await parseRepositoryUrl(
        'https://github.com/user/repo/'
      );
      expect(result.owner).toBe('user');
      expect(result.repo).toBe('repo');
    });

    it('should handle git URLs', async () => {
      const result = await parseRepositoryUrl(
        'git@github.com:user/repo.git'
      );
      expect(result.owner).toBe('user');
      expect(result.repo).toBe('repo');
    });
  });
});
```

### 2.3 Utility Function Tests

**File: `__tests__/lib/utils/markdown.test.ts`**
```typescript
import { formatMarkdown, extractCodeBlocks, sanitizeMarkdown } from '@/lib/utils/markdown';

describe('Markdown Utilities', () => {
  describe('formatMarkdown', () => {
    it('should format markdown correctly', () => {
      const input = '# Title\n\nParagraph with **bold** text.';
      const result = formatMarkdown(input);
      expect(result).toContain('<h1>');
      expect(result).toContain('<strong>');
    });

    it('should handle code blocks', () => {
      const input = '```typescript\nconst x = 1;\n```';
      const result = formatMarkdown(input);
      expect(result).toContain('language-typescript');
    });
  });

  describe('extractCodeBlocks', () => {
    it('should extract code blocks from markdown', () => {
      const input = '```js\nconst x = 1;\n```\n\nText\n\n```python\nprint("hi")\n```';
      const blocks = extractCodeBlocks(input);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].language).toBe('js');
      expect(blocks[1].language).toBe('python');
    });
  });

  describe('sanitizeMarkdown', () => {
    it('should remove dangerous content', () => {
      const input = '<script>alert("xss")</script>\n# Safe content';
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('# Safe content');
    });
  });
});
```

## 3. Component Tests

### 3.1 Button Component Test

**File: `__tests__/components/ui/Button.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply variant styles', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    expect(container.querySelector('button')).toHaveClass('bg-primary-500');
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply size classes', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.querySelector('button')).toHaveClass('px-6', 'py-3');
  });
});
```

### 3.2 Input Component Test

**File: `__tests__/components/ui/Input.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('should render input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    await userEvent.type(input, 'test value');
    expect(input).toHaveValue('test value');
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
```

## 4. Integration Tests

### 4.1 API Route Tests

**File: `__tests__/api/analyze.test.ts`**
```typescript
import { POST } from '@/app/api/analyze/route';

describe('POST /api/analyze', () => {
  it('should return 400 for invalid input', async () => {
    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: '' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.status).toBe('error');
  });

  it('should return 400 for missing inputType', async () => {
    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'https://github.com/user/repo' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle valid GitHub URL', async () => {
    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        input: 'https://github.com/user/repo',
        inputType: 'url',
      }),
    });

    // Mock GitHub API
    jest.mock('@/lib/api/github', () => ({
      GitHubClient: jest.fn().mockImplementation(() => ({
        getRepository: jest.fn().mockResolvedValue({
          name: 'repo',
          owner: 'user',
          description: 'Test',
          language: 'TypeScript',
          stars: 100,
          url: 'https://github.com/user/repo',
        }),
        getReadme: jest.fn().mockResolvedValue('# Test'),
        getFileContent: jest.fn().mockResolvedValue('{}'),
      })),
    }));

    // Note: Full integration test would require mocking all dependencies
  });
});
```

### 4.2 Analysis Service Tests

**File: `__tests__/lib/analysis/service.test.ts`**
```typescript
import { AnalysisService } from '@/lib/analysis/service';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    service = new AnalysisService();
  });

  it('should analyze repository successfully', async () => {
    // Mock all dependencies
    jest.mock('@/lib/api/github');
    jest.mock('@/lib/api/mimo');

    // Test implementation
  });

  it('should fallback to Groq on MiMo failure', async () => {
    // Mock MiMo to fail
    // Mock Groq to succeed
    // Verify fallback behavior
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    // Verify error handling
  });
});
```

## 5. E2E Tests

### 5.1 Playwright Configuration

**File: `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5.2 E2E Test Examples

**File: `e2e/landing.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MiMo Repo Doctor/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('MiMo GitHub Repo Doctor');
  });

  test('should have input field for GitHub URL', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder*="github"]');
    await expect(input).toBeVisible();
  });

  test('should validate GitHub URL on blur', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder*="github"]');
    
    await input.fill('invalid-url');
    await input.blur();
    
    await expect(page.locator('text=Invalid GitHub URL')).toBeVisible();
  });

  test('should show feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=README Improvements')).toBeVisible();
    await expect(page.locator('text=Installation Guide')).toBeVisible();
    await expect(page.locator('text=Issue Checklist')).toBeVisible();
    await expect(page.locator('text=Grant Pitch')).toBeVisible();
  });
});
```

**File: `e2e/analysis.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Repository Analysis', () => {
  test('should analyze repository from URL', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('input[placeholder*="github"]');
    await input.fill('https://github.com/vercel/next.js');
    
    const analyzeButton = page.locator('button:has-text("Analyze")');
    await analyzeButton.click();
    
    // Wait for analysis to complete
    await page.waitForURL('/results*', { timeout: 60000 });
    
    // Verify results page
    await expect(page.locator('text=Analysis Complete')).toBeVisible();
  });

  test('should display all result tabs', async ({ page }) => {
    await page.goto('/results?data={}');
    
    await expect(page.locator('button:has-text("README")')).toBeVisible();
    await expect(page.locator('button:has-text("Install Guide")')).toBeVisible();
    await expect(page.locator('button:has-text("Issues")')).toBeVisible();
    await expect(page.locator('button:has-text("Grant Pitch")')).toBeVisible();
  });

  test('should copy content to clipboard', async ({ page, context }) => {
    await page.goto('/results?data={}');
    
    // Grant clipboard permission
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const copyButton = page.locator('button:has-text("Copy")').first();
    await copyButton.click();
    
    // Verify toast notification
    await expect(page.locator('text=Copied to clipboard')).toBeVisible();
  });
});
```

## 6. Performance Tests

### 6.1 Lighthouse Testing

```bash
# Install Lighthouse CLI
npm install --save-dev @lhci/cli@0.9.x @lhci/server@0.9.x

# Run Lighthouse audit
lhci autorun
```

**File: `lighthouserc.json`**
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3,
      "settings": {
        "chromeFlags": "--no-sandbox"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

## 7. Test Scripts

### 7.1 Package.json Test Commands

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:lighthouse": "lhci autorun",
    "test:all": "npm run test && npm run test:e2e && npm run test:lighthouse"
  }
}
```

## 8. CI/CD Test Integration

### 8.1 GitHub Actions Test Workflow

**File: `.github/workflows/test.yml`**
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test:lighthouse
```

## 9. Test Coverage Goals

### 9.1 Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Statements | 80% | - |
| Branches | 70% | - |
| Functions | 70% | - |
| Lines | 80% | - |

### 9.2 Critical Path Coverage

- API clients: 100%
- Validation logic: 100%
- Error handling: 95%
- UI components: 80%
- Utilities: 90%

## 10. Testing Best Practices

### 10.1 Do's
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Keep tests isolated and independent
- ✅ Mock external dependencies
- ✅ Test error cases
- ✅ Use fixtures for common test data

### 10.2 Don'ts
- ❌ Don't test third-party libraries
- ❌ Don't create interdependent tests
- ❌ Don't use real API calls in unit tests
- ❌ Don't test implementation details
- ❌ Don't ignore flaky tests
- ❌ Don't skip error case testing

---

*Document Version: 1.0*  
*Last Updated: 2026-05-23*  
*Status: Ready for Testing*