# Techno Ambassador

A global calendar platform dedicated to DJs that enables artists to showcase their availability and upcoming events while allowing fans and event organizers to discover and contact DJs for booking performances.

## Table of Contents

- [Techno Ambassador](#techno-ambassador)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
    - [Key Features](#key-features)
    - [Problem Solved](#problem-solved)
    - [Target Users](#target-users)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [AI Integration](#ai-integration)
    - [CI/CD and Hosting](#cicd-and-hosting)
  - [Getting Started Locally](#getting-started-locally)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Available Scripts](#available-scripts)
  - [Testing](#testing)
    - [Testing Frameworks](#testing-frameworks)
    - [Test Commands](#test-commands)
    - [Test Structure](#test-structure)
    - [Writing Tests](#writing-tests)
  - [Project Scope](#project-scope)
    - [Core Features](#core-features)
    - [Features NOT Included in MVP](#features-not-included-in-mvp)
    - [Technical Limitations](#technical-limitations)
  - [Project Status](#project-status)
    - [Success Metrics](#success-metrics)
  - [License](#license)

## Project Description

Techno Ambassador is a global calendar platform dedicated to DJs that connects three main user groups: DJs managing their calendars, fans seeking information about their favorite artists' performances, and event organizers looking for DJs for their events.

### Key Features

- **DJ Profile Management**: Complete profiles with biography, music styles, social media links, and optional photos
- **Calendar System**: Simple event list with one-year planning horizon and event history preservation
- **Advanced Search & Filtering**: Find DJs by location, music style, availability, and name
- **Mobile-First Design**: Full functionality across web and mobile devices
- **Direct Contact**: Social media integration for booking inquiries
- **SEO-Friendly**: Clean URL structure (e.g., /dj/dj-name)

### Problem Solved

The platform addresses the lack of a centralized tool for DJs to showcase their availability and upcoming performances. It solves several key issues:

**For DJs:**

- Lack of platform to showcase their schedule and availability
- Difficulties in reaching potential clients and fans
- Need to manage multiple communication channels
- Lack of tools for professional presentation of their calendar

**For Fans & Event Organizers:**

- Finding information about DJ availability for specific dates
- Discovering new artists in their area
- Checking performance schedules of favorite DJs
- Contacting artists for potential bookings

### Target Users

- **DJs (Artists)**: Managing their performance calendars and showcasing availability
- **Fans**: Seeking information about their favorite artists' performances
- **Event Organizers**: Looking for DJs for their events and checking availability

## Tech Stack

### Frontend

- **Astro 5** - For creating fast, efficient pages with minimal JavaScript
- **Vue 3** - For interactive components
- **TypeScript 5** - For static typing and improved developer experience
- **Tailwind 4** - For efficient styling
- **PrimeVue** - For accessible UI components

### Backend

- **Supabase** - Comprehensive backend solution providing:
  - PostgreSQL database
  - Built-in user authentication
  - SDK support for multiple languages

### AI Integration

- **Openrouter.ai** - For communication with various AI models to retrieve event data from Facebook

### CI/CD and Hosting

- **GitHub Actions** - For CI/CD pipelines
- **DigitalOcean** - For hosting via Docker image

## Getting Started Locally

### Prerequisites

- Node.js v22 (use [nvm](https://github.com/nvm-sh/nvm) to install the correct version)
- Git

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/techno-ambassador.git
   cd techno-ambassador
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env` file based on `.env.example`)

4. Start the development server
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run dev:e2e` - Start the development server in e2e mode
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint and automatically fix issues
- `npm run lint:check` - Run ESLint without fixing issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code formatting meets Prettier standards

## Testing

The project implements a comprehensive testing strategy with multiple layers to ensure code quality and functionality.

### Testing Frameworks

- **Vitest** - Fast unit testing framework with Vue Test Utils integration
- **Playwright** - End-to-end testing for cross-browser compatibility
- **Vue Test Utils** - Official testing utilities for Vue components
- **MSW (Mock Service Worker)** - API mocking for reliable tests
- **Faker.js** - Test data generation

### Test Commands

```bash
# Unit Tests
npm run test              # Run tests in watch mode
npm run test:watch        # Run tests in watch mode (explicit)
npm run test:ui           # Open Vitest UI for interactive testing
npm run test:coverage     # Run tests with coverage report

# End-to-End Tests
npm run test:e2e          # Run E2E tests headlessly
npm run test:e2e:ui       # Run E2E tests with Playwright UI
npm run test:e2e:headed   # Run E2E tests with visible browser
npm run test:e2e:debug    # Debug E2E tests step by step

# Playwright Project-Specific Tests
npx playwright test --project=chromium-authenticated    # Run authenticated tests only
npx playwright test --project=chromium-unauthenticated  # Run auth/registration tests only
npx playwright test --project=setup                     # Run setup tests only
npx playwright test --ui --project=chromium-authenticated  # Run authenticated tests in UI mode

# All Tests
npm run test:all          # Run all tests with coverage + E2E
```

### Test Structure

```
src/test/               # Unit test configuration
├── setup.ts           # Global test setup and mocks
├── utils.ts           # Test utilities and helpers
└── vitest.d.ts        # TypeScript declarations

e2e/                   # End-to-end tests
├── pages/             # Page Object Model files
├── global-setup.ts    # E2E global setup
├── global-teardown.ts # E2E global cleanup
├── auth.setup.ts      # Authentication setup for tests
└── *.spec.ts          # E2E test files

# Playwright Projects:
# - setup: Handles authentication and creates auth state
# - chromium-authenticated: Tests requiring login (excludes auth flows)
# - chromium-unauthenticated: Auth and registration flow tests

src/**/*.{test,spec}.{ts,vue}  # Unit test files
```

### Writing Tests

**Unit Tests Example:**

```typescript
import { describe, it, expect } from 'vitest';
import { mountComponent } from '@/test/utils';
import MyComponent from './MyComponent.vue';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mountComponent(MyComponent, {
      props: { title: 'Test' },
    });

    expect(wrapper.text()).toContain('Test');
  });
});
```

**E2E Tests Example:**

```typescript
import { test, expect } from '@playwright/test';

test('user can navigate to DJ profile', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="dj-link"]');
  await expect(page).toHaveURL(/\/dj\/.+/);
});
```

**Test Coverage Requirements:**

- **80%** minimum coverage for branches, functions, lines, and statements
- Visual regression testing with Playwright screenshots
- Component interaction testing with Vue Test Utils
- API integration testing with MSW mocks

## Project Scope

### Core Features

- **DJ Registration & Profile Management**: Create and edit profiles with mandatory biography and music styles
- **Calendar Management**: Add, edit, and delete future events with up to one-year planning horizon
- **Search & Discovery**: Browse all DJs with filtering by location, music style, availability, and name search
- **Public DJ Profiles**: Accessible calendars with performance history and upcoming events
- **Social Media Integration**: Contact DJs through Instagram/Facebook links
- **Mobile Responsive Design**: Full functionality across all devices
- **Authentication System**: Secure login/registration with email and password

### Features NOT Included in MVP

- Social features (comments, likes, sharing)
- Event organizer accounts
- Automatic event addition from external sources
- Interactive planning calendar (only simple date selection)
- User verification process
- Conflict resolution for overlapping events
- Marking unavailable days
- Editing or deleting past events
- Internal messaging system
- Payment or booking system
- Integration with external calendars

### Technical Limitations

- No real-time conflict resolution
- DJs responsible for managing overlapping events
- Simple, form-based event creation method
- Contact exclusively through social media
- No external login services (Google, GitHub)

## Project Status

The project is currently in development. Initial focus is on implementing core features related to DJ profile management, calendar system, and search functionality.

### Success Metrics

- **90%** of DJ users have filled calendars in the current month (at least one event)
- **95%** of profiles have complete biography and music styles
- **80%** of profiles have added social media contacts

## License

[MIT License](LICENSE)

---

**Project Structure:**

- `./src` - Source code
- `./src/layouts` - Astro layouts
- `./src/pages` - Astro pages
- `./src/pages/api` - API endpoints
- `./src/features/feature-1` - Feature client-side components (Astro static, Vue dynamic)
- `./src/shared/components` - Reusable client-side components (Astro static, Vue dynamic)
- `./src/assets` - Static internal assets
- `./public` - Public assets
