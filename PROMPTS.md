# MiMo GitHub Repo Doctor - AI Prompt Engineering Guide

## 1. MiMo AI Analysis Prompt Structure

### 1.1 System Prompt

```
You are an expert GitHub repository analyst specializing in grant applications and hackathon submissions. Your role is to analyze repositories and provide actionable recommendations to improve their presentation, documentation, and grant-readiness.

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
```

### 1.2 User Prompt Template

```
Analyze the following GitHub repository for grant/hackathon readiness:

**Repository Information:**
- Name: {repo_name}
- Owner: {repo_owner}
- Description: {repo_description}
- Primary Language: {primary_language}
- Stars: {star_count}
- URL: {repo_url}

**README.md Content:**
```
{readme_content}
```

**package.json (if available):**
```json
{package_json_content}
```

**Repository Structure:**
```
{repo_tree}
```

**Error Log (if provided):**
```
{error_log}
```

---

Please provide a comprehensive analysis in the following format:

## 1. README Analysis
- Current score (0-10)
- Missing elements
- Specific improvements with examples
- Badge recommendations
- Screenshot/demo suggestions

## 2. Installation Guide
- Prerequisites list
- Step-by-step installation instructions
- Environment variable setup
- Common troubleshooting issues

## 3. Issue Checklist
Categorize issues as:
- 🔴 Critical (must fix before submission)
- 🟡 Important (recommended)
- 🟢 Nice to Have (polish)

## 4. Grant Pitch
- One-line pitch
- Problem statement (2-3 paragraphs)
- Solution description
- Technical implementation overview
- Impact and metrics
- Roadmap and milestones

Format all code examples in markdown with proper syntax highlighting.
Be specific with file names, line numbers, and exact changes needed.
```

## 2. Response Parsing Strategy

### 2.1 Expected Response Structure

```json
{
  "readme": {
    "score": 7,
    "current_state": "The README has basic information but lacks visual elements and detailed setup instructions.",
    "missing_elements": [
      "Project badges (build status, license, version)",
      "Screenshots or demo GIF",
      "Contributing guidelines",
      "License information",
      "API documentation"
    ],
    "improvements": [
      {
        "title": "Add Status Badges",
        "priority": "high",
        "description": "Add build status, license, and version badges to the top of README",
        "code_example": "![Build Status](https://img.shields.io/github/workflow/status/user/repo/CI)\n![License](https://img.shields.io/github/license/user/repo)\n![Version](https://img.shields.io/github/v/release/user/repo)",
        "impact": "Increases credibility and provides quick project status overview"
      }
    ],
    "suggestions": [
      "Add a demo GIF showing key features",
      "Include a 'Why this project?' section",
      "Add contributor acknowledgments"
    ]
  },
  "installation": {
    "prerequisites": [
      "Node.js 18 or higher",
      "npm or yarn package manager",
      "Git for version control"
    ],
    "steps": [
      {
        "number": 1,
        "title": "Clone Repository",
        "command": "git clone https://github.com/user/repo.git\ncd repo",
        "description": "Clone the repository to your local machine"
      },
      {
        "number": 2,
        "title": "Install Dependencies",
        "command": "npm install",
        "description": "Install all required npm packages"
      }
    ],
    "environment_setup": {
      "required_vars": ["API_KEY", "DATABASE_URL"],
      "example": "API_KEY=your_key_here\nDATABASE_URL=postgresql://localhost:5432/db"
    },
    "common_issues": [
      {
        "issue": "Port 3000 already in use",
        "solution": "Use PORT=3001 npm run dev to run on a different port"
      }
    ]
  },
  "issues": {
    "critical": [
      {
        "title": "Add LICENSE file",
        "description": "Repository lacks a license file. Most grants require open source licensing.",
        "action": "Add MIT or Apache 2.0 license file",
        "priority": "critical"
      }
    ],
    "important": [
      {
        "title": "Add unit tests",
        "description": "No test coverage found. Tests demonstrate code quality.",
        "action": "Set up Jest/Vitest and add tests for core functionality",
        "priority": "important"
      }
    ],
    "nice_to_have": [
      {
        "title": "Add code comments",
        "description": "Complex logic could benefit from inline documentation",
        "action": "Add JSDoc comments to public functions",
        "priority": "low"
      }
    ]
  },
  "pitch": {
    "one_liner": "AI-powered developer tool that automates X to solve Y for Z users",
    "problem_statement": "Developers face significant challenges when...",
    "solution": "Our project addresses this by...",
    "technical_implementation": "Built with Next.js, TypeScript, and AI APIs...",
    "impact": "This project will benefit 10,000+ developers by...",
    "roadmap": [
      "Q2 2026: MVP launch with core features",
      "Q3 2026: Add advanced analytics",
      "Q4 2026: Enterprise features and API"
    ]
  }
}
```

### 2.2 Fallback Parsing

If AI response is not in JSON format, use regex patterns to extract sections:

```typescript
function parseMarkdownResponse(markdown: string) {
  const sections = {
    readme: extractSection(markdown, /## 1\. README Analysis/i, /## 2\./i),
    installation: extractSection(markdown, /## 2\. Installation Guide/i, /## 3\./i),
    issues: extractSection(markdown, /## 3\. Issue Checklist/i, /## 4\./i),
    pitch: extractSection(markdown, /## 4\. Grant Pitch/i, /##|$/i),
  };
  
  return {
    readme: parseReadmeSection(sections.readme),
    installation: parseInstallationSection(sections.installation),
    issues: parseIssuesSection(sections.issues),
    pitch: parsePitchSection(sections.pitch),
  };
}
```

## 3. Prompt Optimization Strategies

### 3.1 Context Window Management

**Priority order for context inclusion:**
1. README.md (always include, truncate if > 10KB)
2. package.json/requirements.txt (always include)
3. Repository structure (top 2 levels only)
4. Error logs (if provided, max 5KB)
5. Key files (LICENSE, CONTRIBUTING.md) - excerpts only

**Token budget allocation:**
- System prompt: ~500 tokens
- Repository metadata: ~200 tokens
- README content: ~3000 tokens
- package.json: ~500 tokens
- Repo structure: ~1000 tokens
- Error log: ~1000 tokens
- Response: ~4000 tokens
- **Total: ~10,200 tokens** (well within most model limits)

### 3.2 Few-Shot Examples

Include 1-2 examples in system prompt for consistency:

```
Example Analysis:

Repository: "awesome-todo-app"
README Score: 4/10

Missing Elements:
- No demo GIF or screenshots
- Installation instructions are incomplete
- No contributing guidelines

Improvement #1: Add Demo Section
```markdown
## Demo

![Demo GIF](./docs/demo.gif)

Key features:
- ✅ Real-time sync
- ✅ Offline support
- ✅ Dark mode
```

This shows users what to expect and increases engagement by 3x.
```

### 3.3 Temperature & Sampling Settings

**For MiMo API:**
```json
{
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 4000,
  "frequency_penalty": 0.3,
  "presence_penalty": 0.1
}
```

**For Groq (Llama 3.3 70B):**
```json
{
  "temperature": 0.6,
  "top_p": 0.85,
  "max_tokens": 4000
}
```

Lower temperature (0.6-0.7) for more consistent, factual analysis.

## 4. Prompt Variations by Repository Type

### 4.1 Web Application

```
Additional focus areas:
- Deployment instructions (Vercel, Netlify, Railway)
- Environment variable documentation
- API endpoint documentation
- Security considerations (CORS, auth, rate limiting)
- Performance optimization suggestions
```

### 4.2 Library/Package

```
Additional focus areas:
- API documentation completeness
- Usage examples and code snippets
- Installation from package manager (npm, pip, cargo)
- Versioning and changelog
- Breaking changes documentation
```

### 4.3 CLI Tool

```
Additional focus areas:
- Command-line usage examples
- Installation via package manager or binary
- Configuration file documentation
- Common use cases and workflows
- Error message clarity
```

### 4.4 Blockchain/Web3 Project

```
Additional focus areas:
- Smart contract documentation
- Testnet deployment instructions
- Wallet integration guide
- Gas optimization notes
- Security audit status
```

## 5. Quality Assurance Prompts

### 5.1 Validation Prompt

After generating analysis, validate with:

```
Review the analysis you just provided and check:
1. Are all code examples syntactically correct?
2. Are file paths and commands accurate?
3. Are recommendations specific (not generic)?
4. Is the grant pitch compelling and clear?
5. Are priority levels appropriate?

If any issues found, provide corrections.
```

### 5.2 Refinement Prompt

For low-quality initial responses:

```
The analysis needs more specificity. For each recommendation:
1. Provide exact code examples (not placeholders)
2. Reference specific files and line numbers
3. Explain the impact of each change
4. Include before/after comparisons where relevant

Regenerate the analysis with these improvements.
```

## 6. Error Handling Prompts

### 6.1 Incomplete Repository Data

```
Note: Some repository data is missing or inaccessible:
- README.md: {status}
- package.json: {status}
- Repository structure: {status}

Provide analysis based on available data and note what additional information would improve the assessment.
```

### 6.2 Private Repository

```
This repository is private or inaccessible. Based on the provided tree structure and any pasted content, provide:
1. General best practices for this type of project
2. Common missing elements in similar repositories
3. Template recommendations for README and documentation
```

## 7. Prompt Chaining Strategy

For complex analysis, break into multiple prompts:

### 7.1 Stage 1: Initial Assessment
```
Analyze this repository and provide:
1. Overall quality score (0-10)
2. Top 3 strengths
3. Top 3 critical gaps
4. Repository type classification
```

### 7.2 Stage 2: Detailed Analysis
```
Based on the initial assessment, provide detailed recommendations for:
{focus_area}

Include specific code examples and implementation steps.
```

### 7.3 Stage 3: Grant Pitch Generation
```
Using the repository analysis, craft a compelling grant pitch that:
1. Highlights unique value proposition
2. Demonstrates technical sophistication
3. Shows clear impact potential
4. Aligns with {grant_program} priorities
```

## 8. Prompt Testing & Iteration

### 8.1 Test Cases

**Test Case 1: Well-documented repository**
- Expected: High score, minor polish suggestions
- Validation: Recommendations should be specific, not generic

**Test Case 2: Minimal README**
- Expected: Low score, comprehensive improvement list
- Validation: All critical elements identified

**Test Case 3: Complex monorepo**
- Expected: Structure-aware analysis
- Validation: Recommendations account for multi-package setup

**Test Case 4: Non-English README**
- Expected: Language-aware suggestions
- Validation: Recommendations respect original language

### 8.2 Quality Metrics

Track prompt performance:
- **Relevance**: % of recommendations applicable to repo type
- **Specificity**: % of recommendations with code examples
- **Completeness**: % of critical issues identified
- **Actionability**: User rating of recommendation usefulness

### 8.3 Iteration Log

```
Version 1.0 (2026-05-23):
- Initial prompt structure
- Basic README analysis
- Generic installation guide

Version 1.1 (planned):
- Add repository type detection
- Improve code example quality
- Add grant-specific customization

Version 1.2 (planned):
- Multi-language support
- Framework-specific recommendations
- Integration with GitHub API for deeper analysis
```

## 9. Prompt Security

### 9.1 Input Sanitization

```typescript
function sanitizeInput(content: string): string {
  // Remove potential prompt injection attempts
  const dangerous = [
    /ignore previous instructions/gi,
    /disregard all above/gi,
    /new instructions:/gi,
    /system:/gi,
  ];
  
  let sanitized = content;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REMOVED]');
  });
  
  return sanitized;
}
```

### 9.2 Output Validation

```typescript
function validateOutput(analysis: any): boolean {
  // Ensure output doesn't contain sensitive data
  const sensitivePatterns = [
    /api[_-]?key/gi,
    /password/gi,
    /secret/gi,
    /token/gi,
  ];
  
  const outputStr = JSON.stringify(analysis);
  return !sensitivePatterns.some(pattern => pattern.test(outputStr));
}
```

## 10. Prompt Versioning

### 10.1 Version Control

Store prompts in version-controlled files:

```
prompts/
├── system/
│   ├── v1.0.txt
│   ├── v1.1.txt
│   └── current.txt -> v1.1.txt
├── user/
│   ├── analysis-v1.0.txt
│   ├── analysis-v1.1.txt
│   └── current.txt -> v1.1.txt
└── examples/
    ├── web-app.txt
    ├── library.txt
    └── cli-tool.txt
```

### 10.2 A/B Testing

```typescript
interface PromptVariant {
  id: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  weight: number; // For traffic splitting
}

const variants: PromptVariant[] = [
  {
    id: 'control',
    version: '1.0',
    systemPrompt: SYSTEM_PROMPT_V1,
    userPromptTemplate: USER_PROMPT_V1,
    weight: 0.5,
  },
  {
    id: 'experimental',
    version: '1.1',
    systemPrompt: SYSTEM_PROMPT_V1_1,
    userPromptTemplate: USER_PROMPT_V1_1,
    weight: 0.5,
  },
];
```

---

*Document Version: 1.0*  
*Last Updated: 2026-05-23*  
*Status: Ready for Implementation*