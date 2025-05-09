# Techno Ambassador

A centralized platform for techno music event ratings, reviews, and information.

## Table of Contents

- [Techno Ambassador](#techno-ambassador)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
    - [Key Features](#key-features)
    - [Problem Solved](#problem-solved)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [AI Integration](#ai-integration)
    - [CI/CD and Hosting](#cicd-and-hosting)
  - [Getting Started Locally](#getting-started-locally)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Available Scripts](#available-scripts)
  - [Project Scope](#project-scope)
    - [Features Included](#features-included)
    - [Limitations](#limitations)
    - [User Roles](#user-roles)
  - [Project Status](#project-status)
    - [Success Metrics](#success-metrics)
  - [License](#license)

## Project Description

Techno Ambassador is a platform that brings together all event cycles and events related to techno music. The main purpose of the platform is to enable users to check event ratings and provide ratings and comments on completed events.

### Key Features

- User registration and authentication
- Browsing and searching for techno music events
- Rating events on a scale of 1-5
- Commenting on events
- AI-powered integration with Facebook for event data retrieval
- Administrator dashboard for event management
- Analytics integration for monitoring user activity

### Problem Solved

The platform addresses the lack of a central place where techno music fans can rate, comment on, and learn about events. This solves several issues:

- Provides reliable event ratings to help users choose valuable events
- Creates opportunity to share opinions and experiences after events
- Gives users insight into ratings from other participants
- Helps event organizers understand how to improve future events

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
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint and automatically fix issues
- `npm run lint:check` - Run ESLint without fixing issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code formatting meets Prettier standards

## Project Scope

### Features Included

- Basic user authentication (registration, login)
- Event browsing and rating
- Commenting on events
- Administrator event management
- AI integration for data retrieval from Facebook
- Analytics integration

### Limitations

- Limited to basic authentication without advanced account management
- Event creation limited to administrators only
- AI integration limited to location data retrieval from Facebook
- Only two user roles: regular user and administrator

### User Roles

- **Regular User**: Can register, login, browse events, rate events, and add comments
- **Administrator**: Can add new events, approve or supplement data from AI integration

## Project Status

The project is currently in development. Initial focus is on implementing core features related to user authentication, event management, and the rating system.

### Success Metrics

- At least 65% of logged-in users cast one vote on completed events each week
- At least 33% of users who cast a vote also add a comment
- Metrics monitored through integration with analytical tools

## License

[MIT License](LICENSE)

---

Project structure:

- `./src` - Source code
- `./src/layouts` - Astro layouts
- `./src/pages` - Astro pages
- `./src/pages/api` - API endpoints
- `./src/components` - Client-side components (Astro for static, Vue for dynamic)
- `./src/assets` - Static internal assets
- `./public` - Public assets
