# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for the Techno Ambassador project.

## Workflows

### `master.yml` - Main CI/CD Pipeline

A comprehensive pipeline that ensures code quality, runs tests, and verifies production builds.

#### Triggers

- **Manual**: Can be triggered manually via GitHub Actions UI (`workflow_dispatch`)
- **Push to master**: Automatically runs on every push to the `master` branch
- **Pull requests**: Runs on pull requests targeting the `master` branch

#### Jobs

1. **Code Quality Checks** (`code-quality`)

   - Runs ESLint to check for code quality issues
   - Runs Prettier to verify code formatting
   - Fails fast if code doesn't meet standards

2. **Unit & Integration Tests** (`unit-tests`)

   - Runs Vitest with coverage reporting
   - Ensures all unit and integration tests pass

3. **Production Build** (`build`)

   - Verifies the application builds successfully for production
   - Depends on code quality and unit tests passing

4. **CI Success** (`ci-success`)
   - Summary job that checks all previous jobs
   - Provides clear success/failure status
   - Required for branch protection rules

#### Technology Stack Integration

The pipeline is designed specifically for the Techno Ambassador tech stack:

- **Node.js 22** (from `.nvmrc`)
- **Astro 5** with Vue 3 components
- **TypeScript 5** for type checking
- **Vitest** for unit/integration testing
- **Playwright** for E2E testing
- **ESLint + Prettier** for code quality

#### Artifacts

TODO: Add artifacts, retention days, etc.

#### Performance Optimizations

- Uses `npm ci` for faster, reliable dependency installation
- Leverages GitHub Actions caching for Node.js dependencies
- Runs jobs in parallel where possible to reduce total execution time
- Fails fast on code quality issues to save compute resources

## Usage

### Running Manually

1. Go to Actions tab in GitHub
2. Select "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Choose the branch (typically `master`)

### Branch Protection

Consider setting up branch protection rules that require:

- CI Pipeline Success check to pass
- Up-to-date branches before merging
- Review requirements for pull requests

### Local Development

Before pushing, ensure your code passes locally:

```bash
npm run lint:check     # ESLint check
npm run format:check   # Prettier check
npm run test:coverage  # Unit tests with coverage
npm run test:e2e       # E2E tests
npm run build          # Production build
```
