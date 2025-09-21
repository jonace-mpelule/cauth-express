# 🔐 CAuth - Custom Authentication for Node.js

[![npm version](https://badge.fury.io/js/%40cauth%2Fexpress.svg)](https://badge.fury.io/js/%40cauth%2Fexpress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

> **The Complete Authentication Solution for Modern Node.js Applications**

CAuth (Custom Auth) is a powerful, flexible, and secure authentication library designed to handle all your authentication needs with minimal configuration. Built with TypeScript and following industry standards, CAuth provides JWT management, role-based access control, password security, and much more.

## ✨ Features

- 🔑 **JWT Token Management** - Access & Refresh token handling
- 👥 **Role-Based Access Control** - Flexible role management
- 🔄 **Automatic Token Refresh** - Seamless token renewal
- 📱 **Multi-Provider Support** - Email, Phone Number, or both
- 🛡️ **Security First** - Industry-standard security practices
- 🎯 **Zero Configuration** - Works out of the box
- 📦 **Framework Agnostic** - Works with Express, Fastify, and more
- 🔧 **TypeScript Ready** - Full type safety and IntelliSense
- 🚀 **Performance Optimized** - Built for production environments
- 🔐 **2FA Ready** - Two-factor authentication support (coming soon)

## 🚀 Quick Start

### Installation

```bash
# Using pnpm (recommended)
pnpm add @cauth/express

# Using npm
npm install @cauth/express

# Using yarn
yarn add @cauth/express
```

### Database Schema

CAuth requires a simple database schema. Here's the Prisma model:

```prisma
model Auth {
  id            String    @id @default(uuid())
  phoneNumber   String?   @unique
  email         String?   @unique
  passwordHash  String
  role          String
  lastLogin     DateTime
  refreshTokens String[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Basic Setup

```typescript
import CAuth, { PrismaProvider } from '@cauth/express';
import { PrismaClient } from '@prisma/client';

// Initialize your database client
const prisma = new PrismaClient();

// Create CAuth instance
const auth = new CAuth({
  DbProvider: new PrismaProvider(prisma),
  Roles: ['user', 'admin', 'moderator'],
  AccessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  RefreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  JwtConfig: {
    AccessTokenLifeSpan: '15m',
    RefreshTokenLifeSpan: '7d',
  },
});

export default auth;
```

## 📖 Documentation

### 🏗️ Architecture

CAuth follows a modular architecture that separates concerns:

- **Routes** - Ready-to-use Express route handlers
- **Functions** - Core authentication logic
- **Middleware** - Authentication guards and protection
- **Providers** - Database abstraction layer
- **Tokens** - JWT management utilities

### 🔧 Configuration

```typescript
interface Config {
  DbProvider: DbProvider;           // Database provider instance
  Roles: string[];                  // Available roles in your system
  AccessTokenSecret: string;        // Secret for access tokens
  RefreshTokenSecret: string;       // Secret for refresh tokens
  JwtConfig?: {                     // Optional JWT configuration
    AccessTokenLifeSpan?: string;   // Default: '15m'
    RefreshTokenLifeSpan?: string;  // Default: '7d'
  };
}
```

### 🛡️ Middleware

#### AuthGuard

Protect routes with role-based access control:

```typescript
import auth from './auth.config';

// Protect route for any authenticated user
app.get('/profile', auth.Guard(), (req, res) => {
  res.json({ user: req.cauth });
});

// Protect route for specific roles
app.get('/admin', auth.Guard(['admin']), (req, res) => {
  res.json({ message: 'Admin only content' });
});

// Multiple roles allowed
app.get('/moderate', auth.Guard(['admin', 'moderator']), (req, res) => {
  res.json({ message: 'Moderator or admin content' });
});
```

### 🛠️ Routes

CAuth provides ready-to-use route handlers:

```typescript
import auth from './auth.config';

// Authentication routes
app.post('/auth/register', auth.Routes.Register());
app.post('/auth/login', auth.Routes.Login());
app.post('/auth/refresh', auth.Routes.Refresh());
app.post('/auth/logout', auth.Routes.Logout());
app.post('/auth/change-password', auth.Routes.ChangePassword());
```

### 🔨 Functions

Use CAuth functions for custom implementations:

```typescript
import auth from './auth.config';

// Custom registration endpoint
app.post('/custom/register', async (req, res) => {
  try {
    const result = await auth.FN.Register({
      email: req.body.email,
      password: req.body.password,
      role: 'user',
    });

    if (result.success) {
      res.status(201).json({
        message: 'User registered successfully',
        userId: result.data.id,
      });
    } else {
      res.status(400).json({
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 🔑 Token Management

CAuth handles JWT tokens automatically:

```typescript
// Generate token pairs
const tokens = await auth.Tokens.GenerateTokenPairs({
  id: user.id,
  role: user.role,
});

// Verify access token
const payload = await auth.Tokens.VerifyAccessToken<{ id: string; role: string }>(
  accessToken
);

// Verify refresh token
const refreshPayload = await auth.Tokens.VerifyRefreshToken<{ id: string }>(
  refreshToken
);
```

## 📋 API Reference

### Registration

Register a new user with email or phone number:

```typescript
// Email registration
await auth.FN.Register({
  email: 'user@example.com',
  password: 'securePassword123',
  role: 'user',
});

// Phone registration
await auth.FN.Register({
  phoneNumber: '+1234567890',
  password: 'securePassword123',
  role: 'user',
});
```

### Login

Authenticate users with email or phone:

```typescript
// Email login
const result = await auth.FN.Login({
  email: 'user@example.com',
  password: 'securePassword123',
});

// Phone login
const result = await auth.FN.Login({
  phoneNumber: '+1234567890',
  password: 'securePassword123',
});
```

### Password Management

```typescript
// Change password (requires authentication)
await auth.FN.ChangePassword({
  accountId: userId,
  oldPassword: 'oldPassword',
  newPassword: 'newSecurePassword',
});
```

### Token Refresh

```typescript
// Refresh tokens
const result = await auth.FN.Refresh({
  refreshToken: 'your-refresh-token',
});
```

### Logout

```typescript
// Logout user
await auth.FN.Logout({
  refreshToken: 'your-refresh-token',
});
```

## 🔒 Security Features

### Password Security
- **Bcrypt Hashing** - Industry-standard password hashing
- **Salt Rounds** - Configurable salt rounds (default: 10)
- **Password Validation** - Built-in password strength requirements

### JWT Security
- **Separate Secrets** - Different secrets for access and refresh tokens
- **Short-lived Access Tokens** - Default 15 minutes
- **Long-lived Refresh Tokens** - Default 7 days
- **Token Rotation** - Automatic refresh token rotation

### Role-Based Access Control
- **Flexible Roles** - Define custom roles for your application
- **Middleware Protection** - Easy route protection
- **Permission Validation** - Server-side role validation

## 🎯 Use Cases

### E-commerce Platform
```typescript
// Customer registration
app.post('/customers/register', auth.Routes.Register());

// Admin panel protection
app.use('/admin', auth.Guard(['admin']));

// Customer profile protection
app.use('/profile', auth.Guard(['customer', 'admin']));
```

### SaaS Application
```typescript
// Multi-tenant with roles
const roles = ['user', 'admin', 'owner', 'billing'];

// Protect billing routes
app.use('/billing', auth.Guard(['owner', 'billing']));

// Protect admin features
app.use('/admin', auth.Guard(['admin', 'owner']));
```

### Mobile App Backend
```typescript
// Phone number authentication
app.post('/auth/phone-login', auth.Routes.Login());

// Token refresh for mobile
app.post('/auth/refresh', auth.Routes.Refresh());
```

## 🚀 Advanced Usage

### Custom Database Provider

```typescript
import { DbProvider } from '@cauth/express';

class CustomDbProvider implements DbProvider {
  async findAccountWithCredential({ email, phoneNumber }) {
    // Your custom database logic
  }

  async createAccount({ data }) {
    // Your custom database logic
  }

  // ... implement other required methods
}

const auth = new CAuth({
  DbProvider: new CustomDbProvider(),
  // ... other config
});
```

### Custom Error Handling

```typescript
app.use((error, req, res, next) => {
  if (error.code === 'invalid-credentials') {
    return res.status(401).json({
      error: 'Invalid email or password',
    });
  }
  
  if (error.code === 'account-exists') {
    return res.status(409).json({
      error: 'Account already exists',
    });
  }
  
  next(error);
});
```

### Environment Configuration

```typescript
// .env
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
JWT_ACCESS_LIFESPAN=15m
JWT_REFRESH_LIFESPAN=7d

// auth.config.ts
const auth = new CAuth({
  DbProvider: new PrismaProvider(prisma),
  Roles: process.env.ROLES?.split(',') || ['user', 'admin'],
  AccessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  RefreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  JwtConfig: {
    AccessTokenLifeSpan: process.env.JWT_ACCESS_LIFESPAN,
    RefreshTokenLifeSpan: process.env.JWT_REFRESH_LIFESPAN,
  },
});
```

## 🧪 Testing

CAuth is designed to be easily testable:

```typescript
import { describe, it, expect } from 'vitest';
import auth from './auth.config';

describe('Authentication', () => {
  it('should register a new user', async () => {
    const result = await auth.FN.Register({
      email: 'test@example.com',
      password: 'testPassword123',
      role: 'user',
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
  });

  it('should login with valid credentials', async () => {
    const result = await auth.FN.Login({
      email: 'test@example.com',
      password: 'testPassword123',
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('tokens');
  });
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/jonace-mpelule/cauth-express.git

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the project
pnpm tsdown
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://cauth.dev/docs)
- 🐛 [Issue Tracker](https://github.com/jonace-mpelule/cauth-express/issues)
<!-- - 💬 [Discord Community](https://discord.gg/cauth) -->
- 📧 [Email Support](mailto:support@cauth.dev)

## 🗺️ Roadmap

- [ ] **Multi Database Support** - Support Multiple Databases
- [ ] **2FA Support** - Two-factor authentication
- [ ] **OAuth Integration** - Google, GitHub, etc.
- [ ] **Rate Limiting** - Built-in rate limiting
- [ ] **Session Management** - Advanced session handling
- [ ] **Audit Logging** - Security event logging
- [ ] **Frontend SDK** - React, Vue, Angular support
- [ ] **GraphQL Support** - GraphQL integration
- [ ] **Microservices** - Distributed authentication

## 🙏 Acknowledgments

- [Prisma](https://prisma.io/) - Database toolkit
- [JWT](https://jwt.io/) - JSON Web Tokens
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- [Express](https://expressjs.com/) - Web framework

---

<div align="center">

**Made with ❤️ by Jonace Mpelule (The Halftone Company)**

[⭐ Star us on GitHub](https://github.com/jonace-mpelule/cauth-express/) | [📖 Read the Docs](https://cauth.dev) | [🐛 Report Issues](https://github.com/jonace-mpelule/cauth-express/issues)

</div>
