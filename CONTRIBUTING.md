# MiMo GitHub Repo Doctor - Contributing Guide

## Welcome! 👋

Thank you for your interest in contributing to MiMo GitHub Repo Doctor! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're committed to providing a welcoming and inclusive environment.

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

### Suggesting Features

Have an idea? Open an issue with:
- Feature description
- Use case / problem it solves
- Proposed implementation (optional)
- Mockups / examples (optional)

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mimo-repo-doctor.git
cd mimo-repo-doctor

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Start development server
npm run dev
```

## Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write tests for new features
- Update documentation

## Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

## Commit Messages

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Build/dependencies

Example: `feat: add README analysis feature`

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass: `npm run test:all`
4. Update CHANGELOG.md
5. Request review from maintainers

## Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation
- 🎨 UI/UX improvements
- 🧪 Test coverage
- 🌐 Internationalization

## Questions?

- Open an issue
- Join our Discord
- Email: support@mimo-repo-doctor.com

Thank you for contributing! 🙏
