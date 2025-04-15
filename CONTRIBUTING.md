# Contributing to Training Session Management Application

Thank you for your interest in contributing to the Training Session Management Application! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Environment](#development-environment)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [Documentation](#documentation)
10. [Versioning](#versioning)

## Code of Conduct

Our project adheres to a Code of Conduct that sets expectations for participation in our community. By participating, you are expected to uphold this code. Please read the full text to understand what actions will and will not be tolerated.

Core principles:
- Be respectful and inclusive
- Give and accept constructive feedback
- Focus on what is best for the community

## Getting Started

### Prerequisites

- Node.js 20.x or newer
- PostgreSQL 14.x or newer
- Git

### Local Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/training-session-management.git
   cd training-session-management
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Environment

The application uses the following development tools:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Vite** for frontend development
- **Drizzle** for database schema management

### Useful Commands

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run lint`: Run ESLint to check for issues
- `npm run format`: Run Prettier to format code
- `npm run db:push`: Push schema changes to the database
- `npm run db:generate`: Generate migration files

## Project Structure

The project follows a structured organization:

```
/
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and helpers
│   │   ├── pages/        # Application pages
│   │   └── App.tsx       # Main application component
├── public/               # Static assets
├── server/               # Backend code
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema and types
└── scripts/              # Build and maintenance scripts
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid using `any` type when possible
- Define interfaces for all data structures
- Use type inference where appropriate

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper React Query patterns for data fetching
- Follow the component structure established in the project

### API Design

- Follow RESTful principles for API endpoints
- Maintain backward compatibility for public APIs
- Validate all inputs with Zod schemas
- Return appropriate HTTP status codes

## Commit Guidelines

We follow a modified version of Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process or tools

Example:
```
feat(tasks): add ability to filter tasks by training type

This change allows users to filter tasks based on whether they are
GLR, SLR, or ALL training types.

Resolves #123
```

## Pull Request Process

1. Update documentation if necessary
2. Include tests for new functionality
3. Ensure all tests pass
4. Update the CHANGELOG.md with details of your changes
5. Request review from at least one maintainer
6. PRs require approval before merging

### PR Template

```markdown
## Description
[Description of the changes]

## Related Issue
Fixes #[issue number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Other (please describe)

## Testing
[Describe testing done]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented code in hard-to-understand areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## Testing

We use a combination of testing frameworks:

- **Jest** for unit testing
- **React Testing Library** for component testing
- **Cypress** for end-to-end testing

### Test Coverage

Aim for at least 80% test coverage for new code.

### Running Tests

- `npm run test`: Run all tests
- `npm run test:unit`: Run unit tests only
- `npm run test:e2e`: Run end-to-end tests

## Documentation

All new features should include corresponding documentation:

- **Code Documentation**: Use JSDoc for functions and classes
- **API Documentation**: Update API_DOCUMENTATION.md for API changes
- **User Guide**: Update HOW_TO_USE.md if user-facing features change
- **README**: Update README.md if major changes affect the application

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backward-compatible functionality
- **PATCH** version for backward-compatible bug fixes

---

Thank you for contributing to the Training Session Management Application! Your efforts help make this project better for everyone.