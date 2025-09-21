# 🤝 Contributing to CAuth

Thank you for your interest in contributing to CAuth! We welcome contributions from the community and are grateful for your help in making this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Types of Contributions](#types-of-contributions)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [support@cauth.dev](mailto:support@cauth.dev).

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **pnpm** (recommended) or npm
- **Git**
- **TypeScript** (v5.0.0 or higher)
- **Prisma** (for database operations)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

```bash
git clone https://github.com/your-username/cauth-express.git
cd cauth-express
```

3. **Add the upstream remote**:

```bash
git remote add upstream https://github.com/jonace-mpelule/cauth-express.git
```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cauth_dev"

# JWT Secrets
ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-for-development"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-for-development"

# Optional: JWT Lifespans
JWT_ACCESS_LIFESPAN="15m"
JWT_REFRESH_LIFESPAN="7d"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed the database (optional)
pnpm prisma db seed
```

### 4. Build the Project

```bash
# Build TypeScript
pnpm tsdown

# Watch mode for development
pnpm tsdown --watch
```

## 📁 Project Structure

```
cauth-express/
├── src/
│   ├── fn/                    # Core authentication functions
│   │   ├── change-password.fn.ts
│   │   ├── login.fn.ts
│   │   ├── logout.fn.ts
│   │   ├── refresh.fn.ts
│   │   ├── register.fn.ts
│   │   └── tokens.ts
│   ├── helpers/               # Utility functions
│   │   └── zod-joined-issues.ts
│   ├── middleware/            # Express middleware
│   │   └── auth.guard.ts
│   ├── providers/             # Database providers
│   │   └── prisma.provider.ts
│   ├── routes/                # Express route handlers
│   │   ├── change-password.route.ts
│   │   ├── login.route.ts
│   │   ├── logout.route.ts
│   │   ├── refresh-token.route.ts
│   │   └── register.route.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.t.ts
│   │   ├── config.t.ts
│   │   ├── database.contract.t.ts
│   │   ├── dto-schemas.t.ts
│   │   └── phonenumber-schema.t.ts
│   ├── utils/                 # Utility functions
│   │   └── try-catch.ts
│   ├── cauth.service.ts       # Main CAuth class
│   └── index.ts              # Main export file
├── prisma/
│   └── schema.prisma         # Database schema
├── dist/                     # Compiled output
├── tests/                    # Test files
├── docs/                     # Documentation
├── examples/                 # Usage examples
└── README.md
```

## 📝 Contributing Guidelines

### General Guidelines

1. **Follow the existing code style** and conventions
2. **Write clear, descriptive commit messages**
3. **Add tests** for new features and bug fixes
4. **Update documentation** when necessary
5. **Ensure all tests pass** before submitting
6. **Use TypeScript** for all new code
7. **Follow security best practices**

### Code Style

- **Use TypeScript** with strict mode enabled
- **Follow ESLint** and Prettier configurations
- **Use meaningful variable and function names**
- **Add JSDoc comments** for public APIs
- **Use consistent indentation** (2 spaces)
- **Follow camelCase** for variables and functions
- **Use PascalCase** for classes and interfaces

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add 2FA support for login
fix(tokens): resolve refresh token rotation issue
docs(api): update authentication examples
test(register): add validation tests
```

## 🎯 Types of Contributions

### 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, Node.js version, etc.)
5. **Code examples** if applicable
6. **Error messages** and stack traces

### ✨ Feature Requests

For new features, please provide:

1. **Clear description** of the proposed feature
2. **Use case** and motivation
3. **Proposed implementation** (if you have ideas)
4. **Breaking changes** considerations
5. **Backward compatibility** notes

### 🔧 Code Contributions

We welcome:

- **Bug fixes**
- **New features**
- **Performance improvements**
- **Code refactoring**
- **Test coverage improvements**
- **Documentation updates**

## 🔄 Pull Request Process

### Before Submitting

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Run tests** to ensure everything works:
   ```bash
   pnpm test
   pnpm test:coverage
   ```

4. **Build the project** to check for TypeScript errors:
   ```bash
   pnpm tsdown
   ```

5. **Update documentation** if necessary

6. **Commit your changes** with descriptive messages

### Submitting the PR

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference to related issues
   - Screenshots (if applicable)
   - Testing instructions

3. **Wait for review** and address feedback

### PR Requirements

- [ ] **Tests pass** and coverage is maintained
- [ ] **TypeScript compiles** without errors
- [ ] **Documentation updated** (if needed)
- [ ] **Breaking changes** documented
- [ ] **Security considerations** addressed
- [ ] **Performance impact** considered

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Verify the issue** with the latest version

### Issue Templates

We provide templates for:
- 🐛 **Bug Report**
- ✨ **Feature Request**
- 📚 **Documentation**
- ❓ **Question**

## 🔄 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `docs/*` - Documentation updates

### Workflow Steps

1. **Create issue** or assign existing one
2. **Fork repository** and create feature branch
3. **Implement changes** with tests
4. **Create pull request** to `develop`
5. **Code review** and feedback
6. **Merge to develop** after approval
7. **Release** from develop to main

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/fn/login.fn.test.ts
```

### Test Structure

```typescript
// Example test structure
describe('Authentication', () => {
  describe('Login Function', () => {
    it('should login with valid credentials', async () => {
      // Test implementation
    });

    it('should reject invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

### Test Guidelines

- **Write unit tests** for all functions
- **Write integration tests** for routes
- **Mock external dependencies**
- **Test error cases** and edge cases
- **Maintain high coverage** (>90%)

## 📚 Documentation

### Documentation Standards

- **Use clear, concise language**
- **Provide code examples**
- **Include error handling**
- **Update when code changes**
- **Use proper markdown formatting**

### Documentation Types

- **API Documentation** - Function signatures and usage
- **README Updates** - Installation and setup
- **Code Comments** - Inline documentation
- **Examples** - Usage examples and tutorials

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Steps

1. **Update version** in `package.json`
2. **Update CHANGELOG.md**
3. **Create release tag**
4. **Publish to npm**
5. **Update documentation**

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Project documentation**

## ❓ Getting Help

If you need help contributing:

- 📖 **Read the documentation**
- 💬 **Join our discussions** on GitHub
- 📧 **Email us** at [support@cauth.dev](mailto:support@cauth.dev)
- 🐛 **Create an issue** for questions

## 🙏 Thank You

Thank you for contributing to CAuth! Your contributions help make authentication easier and more secure for developers worldwide.

---

<div align="center">

**Happy Contributing! 🎉**

Made with ❤️ by [Jonace Mpelule](https://github.com/jonace-mpelule) (The Halftone Company)

</div>
