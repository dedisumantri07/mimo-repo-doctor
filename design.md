# MiMo GitHub Repo Doctor - Design Document

## 1. Design System

### 1.1 Visual Identity
- **Primary Color**: `#6366f1` (Indigo) - MiMo brand color
- **Secondary Color**: `#8b5cf6` (Purple) - Accent for AI features
- **Success**: `#10b981` (Green) - Positive feedback
- **Warning**: `#f59e0b` (Amber) - Suggestions
- **Error**: `#ef4444` (Red) - Critical issues
- **Background**: `#0f172a` (Slate 900) - Dark theme base
- **Surface**: `#1e293b` (Slate 800) - Card backgrounds
- **Text Primary**: `#f1f5f9` (Slate 100)
- **Text Secondary**: `#94a3b8` (Slate 400)

### 1.2 Typography
- **Headings**: `font-family: 'Inter', sans-serif` - Bold, clean
- **Body**: `font-family: 'Inter', sans-serif` - Regular
- **Code**: `font-family: 'JetBrains Mono', monospace`
- **Scale**: 
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### 1.3 Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### 1.4 Border Radius
- Small: 4px (buttons, inputs)
- Medium: 8px (cards)
- Large: 12px (modals)
- Full: 9999px (pills, badges)

## 2. Component Library

### 2.1 Core Components

#### Button
```tsx
// Primary: Solid indigo background
// Secondary: Outline with hover fill
// Ghost: Transparent with hover background
// Sizes: sm (32px), md (40px), lg (48px)
```

#### Input Field
```tsx
// Dark background with light border
// Focus: Indigo ring
// Error state: Red border + message
// Icon support: Left/right slots
```

#### Card
```tsx
// Slate 800 background
// Subtle border (slate 700)
// Hover: Slight elevation + border glow
// Padding: 24px
```

#### Badge
```tsx
// Pill shape
// Variants: success, warning, error, info
// Size: sm (20px height), md (24px)
```

#### Tab Navigation
```tsx
// Horizontal tabs with underline indicator
// Active: Indigo underline + text
// Inactive: Slate 400 text
// Smooth transition animation
```

#### Loading Spinner
```tsx
// Animated gradient ring
// Indigo to purple gradient
// Sizes: sm (16px), md (24px), lg (48px)
```

#### Toast Notification
```tsx
// Bottom-right position
// Auto-dismiss after 5s
// Variants: success, error, info
// Slide-in animation
```

## 3. Page Layouts

### 3.1 Landing Page

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] MiMo Repo Doctor              [GitHub] [Docs]   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│              🏥 MiMo GitHub Repo Doctor                  │
│                                                           │
│     AI-powered analysis to make your repo grant-ready    │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  https://github.com/username/repo          [Analyze]│  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│              or paste repository tree below              │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [Textarea for pasting repo structure]            │  │
│  │                                                    │  │
│  │                                                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│                    [Analyze Repository]                  │
│                                                           │
│  ─────────────────────────────────────────────────────  │
│                                                           │
│  ✨ Features                                              │
│  • README improvement suggestions                        │
│  • Installation guide generation                         │
│  • Issue checklist creation                              │
│  • Grant pitch writing                                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Hero section with gradient background
- Large input field with GitHub icon
- Textarea with syntax highlighting for pasted tree
- Feature cards in 2x2 grid below fold
- Animated gradient border on input focus

### 3.2 Analysis Loading Page

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] MiMo Repo Doctor                    [← Back]    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│                  Analyzing Repository...                 │
│                                                           │
│              [Animated spinner with gradient]            │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✓ Fetching repository structure                  │  │
│  │  ✓ Reading README.md                              │  │
│  │  ✓ Parsing package.json                           │  │
│  │  ⏳ Analyzing with MiMo AI...                      │  │
│  │  ⏳ Generating recommendations...                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│              This usually takes 15-30 seconds            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Progress checklist with animated checkmarks
- Pulsing spinner
- Estimated time remaining
- Smooth transitions between steps

### 3.3 Results Page

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] MiMo Repo Doctor                    [← Back]    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📊 Analysis Complete: username/repo-name                │
│                                                           │
│  [README] [Install Guide] [Issues] [Grant Pitch]         │
│  ─────────────────────────────────────────────────────  │
│                                                           │
│  📝 README Improvements                                   │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Current Score: 6/10                    [Copy All]│  │
│  │                                                    │  │
│  │  ⚠️ Missing Elements:                              │  │
│  │  • Project badges (build, license, version)       │  │
│  │  • Screenshots or demo GIF                        │  │
│  │  • Contributing guidelines                        │  │
│  │  • License information                            │  │
│  │                                                    │  │
│  │  ✅ Suggested Improvements:                        │  │
│  │                                                    │  │
│  │  1. Add Status Badges                             │  │
│  │     ```markdown                                    │  │
│  │     ![Build](https://img.shields.io/...)          │  │
│  │     ```                                            │  │
│  │     [Copy]                                         │  │
│  │                                                    │  │
│  │  2. Create Demo Section                           │  │
│  │     Add screenshots showing key features...       │  │
│  │     [Copy Template]                               │  │
│  │                                                    │  │
│  │  3. Improve Installation Section                  │  │
│  │     Current: Basic npm install                    │  │
│  │     Suggested: Step-by-step with env vars...      │  │
│  │     [View Full Guide]                             │  │
│  │                                                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  [Download as Markdown] [Share Results]                  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Tab navigation for 4 output types
- Score indicator with visual progress bar
- Collapsible sections for each recommendation
- Copy buttons for code snippets
- Syntax-highlighted code blocks
- Download/export options

### 3.4 Tab Content Layouts

#### Installation Guide Tab
```
┌───────────────────────────────────────────────────────┐
│  🚀 Installation Guide                      [Copy All]│
│                                                        │
│  Prerequisites                                         │
│  • Node.js 18+ required                               │
│  • npm or yarn package manager                        │
│                                                        │
│  Step 1: Clone Repository                             │
│  ```bash                                               │
│  git clone https://github.com/user/repo.git           │
│  cd repo                                               │
│  ```                                               [Copy]│
│                                                        │
│  Step 2: Install Dependencies                         │
│  ```bash                                               │
│  npm install                                           │
│  ```                                               [Copy]│
│                                                        │
│  Step 3: Configure Environment                        │
│  Create .env file with:                               │
│  ```env                                                │
│  API_KEY=your_key_here                                │
│  DATABASE_URL=...                                      │
│  ```                                               [Copy]│
│                                                        │
│  Step 4: Run Development Server                       │
│  ```bash                                               │
│  npm run dev                                           │
│  ```                                               [Copy]│
│                                                        │
│  ⚠️ Common Issues                                      │
│  • Port 3000 already in use → Use PORT=3001           │
│  • Module not found → Clear node_modules, reinstall   │
│                                                        │
└───────────────────────────────────────────────────────┘
```

#### Issue Checklist Tab
```
┌───────────────────────────────────────────────────────┐
│  ✅ Issue Checklist                         [Copy All]│
│                                                        │
│  🔴 Critical (Fix before submission)                  │
│  [ ] Add LICENSE file                                 │
│  [ ] Remove hardcoded API keys from code              │
│  [ ] Add error handling for API calls                │
│                                                        │
│  🟡 Important (Recommended)                           │
│  [ ] Add unit tests (current coverage: 0%)           │
│  [ ] Create CONTRIBUTING.md                           │
│  [ ] Add GitHub issue templates                       │
│  [ ] Set up CI/CD pipeline                            │
│                                                        │
│  🟢 Nice to Have (Polish)                             │
│  [ ] Add code comments for complex logic              │
│  [ ] Create demo video or GIF                         │
│  [ ] Add JSDoc documentation                          │
│  [ ] Set up Dependabot for security updates          │
│                                                        │
│  [Export as GitHub Issues]                            │
│                                                        │
└───────────────────────────────────────────────────────┘
```

#### Grant Pitch Tab
```
┌───────────────────────────────────────────────────────┐
│  💰 Grant Pitch                             [Copy All]│
│                                                        │
│  Project Name: [Detected from repo]                   │
│                                                        │
│  One-Line Pitch:                                       │
│  [AI-generated compelling one-liner]                  │
│                                                        │
│  Problem Statement:                                    │
│  [2-3 paragraphs describing the problem]              │
│                                                        │
│  Solution:                                             │
│  [How your project solves it]                         │
│                                                        │
│  Technical Implementation:                             │
│  • Tech stack: [Detected from package.json]           │
│  • Key features: [Extracted from README]              │
│  • Innovation: [AI-highlighted unique aspects]        │
│                                                        │
│  Impact & Metrics:                                     │
│  • Target users: [Inferred from project type]         │
│  • Expected reach: [Suggested metrics]                │
│                                                        │
│  Team & Roadmap:                                       │
│  • Current status: [Analyzed from commits]            │
│  • Next milestones: [Suggested based on issues]       │
│                                                        │
│  [Customize Pitch] [Export as PDF]                    │
│                                                        │
└───────────────────────────────────────────────────────┘
```

## 4. Interaction Patterns

### 4.1 Input Methods

**GitHub URL Input:**
- Auto-validate URL format on blur
- Show repository preview (name, stars, language) after validation
- Error states: Invalid URL, private repo, repo not found

**Tree Paste Input:**
- Syntax highlighting for file structure
- Auto-detect common patterns (package.json, README.md)
- Character limit: 50,000 chars
- Expandable textarea

### 4.2 Analysis Flow

1. **Validation** (1-2s)
   - Check GitHub API accessibility
   - Verify repository exists
   - Confirm public access

2. **Data Fetching** (3-5s)
   - Clone repository structure
   - Read key files (README, package.json, etc.)
   - Parse error logs if provided

3. **AI Analysis** (10-20s)
   - Send to MiMo API
   - Stream progress updates
   - Fallback to Groq if MiMo fails

4. **Results Rendering** (1-2s)
   - Parse AI response
   - Format markdown
   - Render tabs

### 4.3 Copy & Export

**Copy Buttons:**
- Individual snippet copy (code blocks)
- Section copy (entire tab content)
- "Copy All" for complete analysis
- Toast notification on success

**Export Options:**
- Download as Markdown (.md)
- Export as PDF (grant pitch only)
- Share via URL (optional, Phase 2)

### 4.4 Error Handling

**Network Errors:**
- Retry button with exponential backoff
- Fallback to alternative AI provider
- Clear error messages

**API Rate Limits:**
- Show remaining quota
- Suggest waiting time
- Option to use cached results

**Invalid Input:**
- Inline validation messages
- Helpful suggestions
- Example inputs

## 5. Responsive Design

### 5.1 Breakpoints
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

### 5.2 Mobile Adaptations
- Stack tabs vertically
- Collapsible sections by default
- Floating action button for copy/export
- Simplified navigation

### 5.3 Tablet Adaptations
- 2-column layout for feature cards
- Side-by-side tabs and content
- Optimized touch targets (44px minimum)

## 6. Accessibility

### 6.1 WCAG 2.1 AA Compliance
- Color contrast ratio ≥ 4.5:1 for text
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators on all interactive elements

### 6.2 Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels for icon buttons
- Role attributes for custom components
- Alt text for all images

### 6.3 Keyboard Shortcuts
- `Tab` / `Shift+Tab`: Navigate elements
- `Enter`: Activate buttons
- `Ctrl+C`: Copy focused content
- `Esc`: Close modals

## 7. Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+
- **Bundle Size**: < 200KB (gzipped)
- **API Response**: < 30s (analysis)

## 8. Animation & Transitions

### 8.1 Micro-interactions
- Button hover: Scale 1.02, 150ms ease
- Card hover: Elevation increase, 200ms ease
- Tab switch: Fade + slide, 300ms ease-in-out
- Copy success: Checkmark animation, 500ms

### 8.2 Loading States
- Skeleton screens for content
- Pulsing animation for placeholders
- Progress bar for long operations
- Spinner for indeterminate waits

### 8.3 Page Transitions
- Fade between pages: 200ms
- Slide-up for modals: 300ms
- Smooth scroll for anchor links

## 9. Component States

### 9.1 Button States
- Default: Solid background
- Hover: Brightness +10%
- Active: Scale 0.98
- Disabled: Opacity 0.5, cursor not-allowed
- Loading: Spinner + disabled

### 9.2 Input States
- Default: Border slate-700
- Focus: Border indigo-500, ring
- Error: Border red-500, error message
- Disabled: Background slate-900, opacity 0.6
- Success: Border green-500, checkmark icon

### 9.3 Card States
- Default: Border slate-700
- Hover: Border indigo-500/50, shadow-lg
- Active: Border indigo-500
- Loading: Skeleton overlay

## 10. Dark Theme (Primary)

All designs default to dark theme:
- Background: Slate 900 (#0f172a)
- Surface: Slate 800 (#1e293b)
- Borders: Slate 700 (#334155)
- Text: Slate 100 (#f1f5f9)
- Accent: Indigo 500 (#6366f1)

Light theme: Phase 2 consideration

## 11. Branding Elements

### 11.1 Logo
- MiMo mascot icon + "Repo Doctor" text
- Stethoscope icon integrated with GitHub logo
- Color: Indigo gradient

### 11.2 Iconography
- Heroicons for UI elements
- Custom icons for analysis types:
  - 📝 README (document with checkmark)
  - 🚀 Installation (rocket)
  - ✅ Issues (checklist)
  - 💰 Grant (trophy/money bag)

### 11.3 Illustrations
- Empty states: Friendly robot doctor
- Error states: Confused robot with tools
- Success states: Celebrating robot

## 12. Code Syntax Highlighting

- Theme: GitHub Dark Dimmed
- Languages: JavaScript, TypeScript, Bash, JSON, Markdown
- Line numbers for blocks > 5 lines
- Copy button on hover

---

*Document Version: 1.0*  
*Last Updated: 2026-05-23*  
*Status: Ready for Development*