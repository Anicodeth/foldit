# FoldIt CLI

A powerful command-line tool for generating Next.js project structures, pages, API routes, Docker configurations, and Kubernetes manifests with best practices and modern conventions.

[![npm version](https://badge.fury.io/js/fold-it.svg)](https://badge.fury.io/js/fold-it)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **📁 Project Structure Generation**: Create organized Next.js project folders with `.gitkeep` files
- **📄 Page Generation**: Generate Next.js pages with optional components and tests
- **🔗 Dynamic Routes**: Support for dynamic and catch-all route generation
- **🌐 API Route Generation**: Create API routes with authentication, Prisma integration, and HTTP methods
- **🔧 Service Generation**: Generate axios-based service files for API calls with advanced features
- **🗄️ Database Integration**: Prisma ORM setup with multiple database providers
- **🔐 Authentication**: NextAuth.js and Better Auth integration with multiple providers
- **🎨 UI Components**: shadcn/ui setup with Tailwind CSS and component generation
- **📝 Code Quality**: ESLint and Prettier configuration with strict rules
- **🐳 Docker Integration**: Generate Docker configurations for development and production
- **☸️ Kubernetes Support**: Create Kubernetes manifests for deployment
- **🧪 Test Integration**: Built-in test file generation with Jest and React Testing Library
- **⚡ TypeScript Support**: Full TypeScript support with proper type definitions

## 📦 Installation

```bash
npm install -g fold-it
```

Or use with npx:

```bash
npx fold-it <command>
```

## 🛠️ Usage

### Generate Project Structure

Create organized folder structures for your Next.js projects:

```bash
# Next.js structure (app router, components, lib, types)
foldit generate-structure --next

# React structure (pages router, components, hooks)
foldit generate-structure --react

# Node.js structure (server-side focused)
foldit generate-structure --node
```

**Next.js Structure:**

```
src/
├── app/                    # App Router entry point
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── api/               # API routes
├── components/             # Reusable UI components
│   └── ui/                # shadcn/ui components
├── lib/                    # Utility functions and DB clients
└── types/                  # Global TS types/interfaces
```

### Generate Pages

Create Next.js pages with various options:

```bash
# Basic page
foldit generate-page about

# With components folder
foldit generate-page user-profile -c

# With test folder
foldit generate-page blog -t

# With both components and tests
foldit generate-page dashboard -c -t

# Dynamic route
foldit generate-page blog -d slug -t

# Catch-all dynamic route
foldit generate-page shop -d slug --catch-all -t
```

**Generated Page Example:**

```tsx
export default function About() {
  return (
    <div>
      <h1>About</h1>
    </div>
  );
}
```

**Dynamic Route Example:**

```tsx
import { useRouter } from "next/router";

export default function Blog() {
  const router = useRouter();
  const slug = router.query.slug as string;

  return (
    <div>
      <h1>Blog</h1>
      <p>slug: {slug}</p>
    </div>
  );
}
```

### Generate Services

Create axios-based service files for API calls with advanced features:

```bash
# Basic service
foldit generate-service user

# With TypeScript types
foldit generate-service posts --with-types

# With authentication and caching
foldit generate-service products --with-auth --with-cache

# With interceptors and retry logic
foldit generate-service orders --with-interceptors --with-retry

# Custom base URL
foldit generate-service api --base-url https://api.example.com --with-types
```

**Generated Service Example:**

```typescript
import axios from "axios";
import { apiClient } from "./axiosConfig";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserResponse,
  ApiError,
} from "./userTypes";

export class UserService {
  private baseUrl =
    "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'/user";

  /**
   * Get all users with pagination
   */
  async getAll(params?: { page?: number; limit?: number; search?: string }) {
    try {
      const response = await apiClient.get<UserListResponse>(this.baseUrl, {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single user by ID
   */
  async getById(id: string) {
    try {
      const response = await apiClient.get<UserResponse>(
        `\${this.baseUrl}/\${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ... more methods
}

// Export singleton instance
export const userService = new UserService();
```

### Generate API Routes

Create Next.js API routes with advanced features:

```bash
# Basic API route (GET, POST)
foldit generate-api user

# With specific HTTP methods
foldit generate-api posts --methods GET,POST,PUT,DELETE

# With authentication
foldit generate-api auth --auth --methods POST

# With Prisma integration
foldit generate-api products --prisma --methods GET,POST

# Dynamic route with parameter
foldit generate-api user -d id --auth --prisma

# Catch-all dynamic route
foldit generate-api files -d path --catch-all --methods GET,POST
```

**Generated API Route Example:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function get(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResult = await authMiddleware(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get dynamic parameter
    const id = request.nextUrl.pathname.split("/").pop();

    // Example database operation
    // const user = await prisma.user.findMany();

    // TODO: Implement GET logic for user
    return NextResponse.json({
      message: "GET User API endpoint",
      id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in get user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Dockerize Your Application

Generate Docker configurations for your Next.js application:

```bash
# Basic Docker setup
foldit dockerize

# With Docker Compose
foldit dockerize --with-compose

# Production-optimized setup
foldit dockerize --production --with-compose

# Custom Node.js version and port
foldit dockerize --node-version 20-alpine --port 8080

# Without .dockerignore
foldit dockerize --no-ignore
```

**Generated Files:**

- `Dockerfile` - Multi-stage build for development and production
- `.dockerignore` - Excludes unnecessary files from build context
- `docker-compose.yml` - Local development with Docker Compose (optional)

### Add Kubernetes Configuration

Generate Kubernetes manifests for deployment:

```bash
# Basic Kubernetes setup
foldit add-kube

# With Ingress and ConfigMap
foldit add-kube --with-ingress --with-configmap

# Custom namespace and replicas
foldit add-kube --namespace production --replicas 3

# LoadBalancer service type
foldit add-kube --service-type LoadBalancer

# Custom image name and tag
foldit add-kube --image-name my-app --image-tag v1.0.0
```

**Generated Files:**

- `k8s/deployment.yaml` - Kubernetes deployment with health checks
- `k8s/service.yaml` - Service configuration
- `k8s/ingress.yaml` - Ingress with SSL (optional)
- `k8s/configmap.yaml` - Environment variables (optional)

## 📋 Command Reference

### Global Options

- `--version, -v`: Show version
- `--help, -h`: Show help message

### Generate Structure

```bash
foldit generate-structure [flags]
```

**Flags:**

- `--next`: Generate Next.js App Router structure
- `--react`: Generate React Pages Router structure
- `--node`: Generate Node.js server structure

### Generate Page

```bash
foldit generate-page <name> [flags]
```

**Flags:**

- `-c, --component`: Include a components folder
- `-t, --test`: Include a test folder with test file
- `-d, --dynamic <segment>`: Create a dynamic route with the specified segment name
- `--catch-all`: Create a catch-all dynamic route (use with -d)

### Generate API

```bash
foldit generate-api <name> [flags]
```

**Flags:**

- `--methods <list>`: Comma-separated HTTP methods (default: GET,POST)
- `--auth`: Include authentication middleware
- `--prisma`: Include Prisma database integration
- `-d, --dynamic <param>`: Create dynamic route with parameter
- `--catch-all, -c`: Use catch-all dynamic route (with -d)

### Integrate Prisma

```bash
foldit integrate prisma [flags]
```

**Flags:**

- `--db <provider>`: Sets DB provider (sqlite, postgresql, mysql, sqlserver, mongodb)
- `--push`: Runs prisma db push after setup
- `--generate`: Runs prisma generate after setup
- `--with-seed`: Adds prisma/seed.ts with basic seeding logic
- `--schema <path>`: Custom path to schema.prisma (default: prisma/schema.prisma)

### Integrate NextAuth.js

```bash
foldit integrate next-auth [flags]
```

**Flags:**

- `--provider <name>`: Adds provider (e.g., github, google, credentials)
- `--prisma`: Uses Prisma adapter + adds session models
- `--session <jwt/database>`: Sets session strategy
- `--env`: Injects needed .env keys for provider setup
- `--route`: Scaffolds app/api/auth/[...nextauth]/route.ts

### Integrate Better Auth

```bash
foldit integrate better-auth [flags]
```

**Flags:**

- `--provider <name>`: Adds provider (e.g., github, google, credentials)
- `--prisma`: Uses Prisma adapter + adds session models
- `--session <jwt/database>`: Sets session strategy
- `--env`: Injects needed .env keys for provider setup
- `--route`: Scaffolds app/api/auth/route.ts

### Integrate ESLint + Prettier

```bash
foldit integrate eslint-prettier [flags]
```

**Flags:**

- `--strict`: Enables strict mode (no-any, no-unused-vars, etc.)
- `--airbnb`: Adds Airbnb ESLint config
- `--typescript`: Adds @typescript-eslint plugin and rules
- `--with-scripts`: Adds lint and format scripts in package.json
- `--ignore <file>`: Adds to .eslintignore or .prettierignore

### Integrate shadcn/ui

```bash
foldit integrate shadcn/ui [flags]
```

**Flags:**

- `--components <list>`: Scaffolds specific components (e.g. button,input,dialog)
- `--theme <name>`: Applies a theme (default: zinc)
- `--dir <path>`: Custom path to generate components (components/ui by default)
- `--tailwind`: Automatically installs Tailwind CSS if missing

### Generate Service

```bash
foldit generate-service <name> [flags]
```

**Flags:**

- `--base-url <url>`: Custom base URL for the service
- `--with-types`: Generate TypeScript types file
- `--with-interceptors`: Include axios interceptors
- `--with-error-handling`: Include comprehensive error handling
- `--with-auth`: Include authentication support
- `--with-retry`: Include retry logic with exponential backoff
- `--with-cache`: Include caching functionality

### Dockerize

```bash
foldit dockerize [flags]
```

**Flags:**

- `--node-version <version>`: Node.js version (default: 18-alpine)
- `--port <number>`: Port number (default: 3000)
- `--with-compose`: Generate docker-compose.yml
- `--with-ignore`: Generate .dockerignore (default: true)
- `--production`: Generate production-optimized Dockerfile

### Add Kubernetes

```bash
foldit add-kube [flags]
```

**Flags:**

- `--namespace <name>`: Kubernetes namespace (default: default)
- `--replicas <number>`: Number of replicas (default: 2)
- `--port <number>`: Port number (default: 3000)
- `--with-ingress`: Generate ingress.yaml
- `--with-configmap`: Generate configmap.yaml
- `--image-name <name>`: Docker image name (default: nextjs-app)
- `--image-tag <tag>`: Docker image tag (default: latest)
- `--service-type <type>`: Service type: ClusterIP, NodePort, LoadBalancer (default: ClusterIP)

## 🎯 Examples

### Complete Project Setup

```bash
# 1. Generate project structure
foldit generate-structure --next

# 2. Generate main pages
foldit generate-page home -c -t
foldit generate-page about -c
foldit generate-page blog -d slug -c -t

# 3. Generate API routes
foldit generate-api auth --auth --methods POST
foldit generate-api posts --prisma --methods GET,POST,PUT,DELETE
foldit generate-api user -d id --auth --prisma

# 4. Generate services for API calls
foldit generate-service user --with-types --with-auth --with-cache
foldit generate-service posts --with-interceptors --with-retry

# 5. Dockerize the application
foldit dockerize --with-compose --production

# 6. Add Kubernetes configuration
foldit add-kube --with-ingress --with-configmap --replicas 3
```

### Production Deployment

```bash
# Generate production-ready Docker setup
foldit dockerize --production --with-compose --node-version 20-alpine

# Create Kubernetes manifests for production
foldit add-kube \
  --namespace production \
  --replicas 3 \
  --with-ingress \
  --with-configmap \
  --service-type LoadBalancer \
  --image-name my-app \
  --image-tag v1.0.0
```

### Blog Application

```bash
# Generate blog structure
foldit generate-structure --next

# Generate blog pages
foldit generate-page blog -c -t
foldit generate-page blog -d slug -c -t
foldit generate-page admin -c -t

# Generate blog APIs
foldit generate-api posts --prisma --methods GET,POST,PUT,DELETE
foldit generate-api posts -d id --prisma --methods GET,PUT,DELETE
foldit generate-api auth --auth --methods POST

# Generate services
foldit generate-service posts --with-types --with-cache
foldit generate-service auth --with-auth --with-interceptors

# Integrate database and auth
foldit integrate prisma --db postgresql --with-seed --push --generate
foldit integrate next-auth --provider github --prisma --env --route --session database

# Add code quality tools
foldit integrate eslint-prettier --strict --typescript --with-scripts --airbnb
foldit integrate shadcn/ui --components button,input,dialog --theme zinc --tailwind

# Containerize and deploy
foldit dockerize --with-compose
foldit add-kube --with-ingress --replicas 2
```

### E-commerce Application

```bash
# Generate structure and pages
foldit generate-structure --next
foldit generate-page products -c -t
foldit generate-page products -d slug -c -t
foldit generate-page cart -c -t
foldit generate-page checkout -c -t

# Generate APIs
foldit generate-api products --prisma --methods GET,POST,PUT,DELETE
foldit generate-api orders --auth --prisma --methods GET,POST
foldit generate-api payments --auth --methods POST

# Generate services
foldit generate-service products --with-types --with-cache --with-retry
foldit generate-service orders --with-auth --with-interceptors

# Integrate tools
foldit integrate prisma --db mysql --with-seed
foldit integrate better-auth --provider credentials --prisma --env --route
foldit integrate eslint-prettier --strict --typescript --with-scripts
foldit integrate shadcn/ui --components button,input,card --theme slate
```

## 🔧 Configuration

The tool automatically detects your project structure and creates files in the appropriate locations. All generated files include:

- **TypeScript support** with proper type definitions
- **ESLint-friendly** code formatting
- **Git-ready** with `.gitkeep` files for empty directories
- **Testing setup** with Jest and React Testing Library
- **Modern Next.js conventions** following App Router patterns
- **Production-ready Docker** configurations with multi-stage builds
- **Kubernetes manifests** with health checks and security best practices

## 🐳 Docker Features

- **Multi-stage builds** for optimized production images
- **Development and production** configurations
- **Health checks** and proper user permissions
- **Docker Compose** for local development
- **Comprehensive .dockerignore** for faster builds

## 🔧 Service Features

- **Axios-based services** with TypeScript support
- **CRUD operations** with proper error handling
- **Authentication integration** with token management
- **Caching functionality** using sessionStorage
- **Retry logic** with exponential backoff
- **Request/response interceptors** for logging and auth
- **TypeScript types** generation for type safety

## 🗄️ Database Integration Features

- **Prisma ORM** setup with multiple database providers
- **Database providers**: SQLite, PostgreSQL, MySQL, SQL Server, MongoDB
- **Schema generation** with custom paths
- **Database seeding** with sample data
- **Migration support** with push and generate commands
- **Type-safe queries** with generated Prisma client

## 🔐 Authentication Features

- **NextAuth.js integration** for App Router
- **Better Auth integration** for modern authentication
- **Multiple providers**: GitHub, Google, Credentials, and more
- **Session strategies**: JWT and database sessions
- **Prisma adapter** for database-backed sessions
- **Environment variables** setup for providers
- **API route scaffolding** for auth endpoints

## 🎨 UI Component Features

- **shadcn/ui setup** with Tailwind CSS
- **Component generation** with custom themes
- **Multiple themes**: zinc, slate, gray, and more
- **Custom directories** for component placement
- **Tailwind CSS** automatic installation
- **Radix UI primitives** for accessible components

## 📝 Code Quality Features

- **ESLint configuration** with strict rules
- **Prettier formatting** for consistent code style
- **Airbnb config** for industry standards
- **TypeScript support** with @typescript-eslint
- **Package.json scripts** for linting and formatting
- **Ignore files** for .eslintignore and .prettierignore

## ☸️ Kubernetes Features

- **Deployment manifests** with resource limits and health checks
- **Service configurations** with multiple types (ClusterIP, NodePort, LoadBalancer)
- **Ingress setup** with SSL termination and routing rules
- **ConfigMap support** for environment variables
- **Security best practices** with non-root users and capability restrictions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Next.js community
- Inspired by modern development practices
- Designed for developer productivity
- Enhanced with containerization and orchestration support

---

**Made with ❤️ for the Next.js community**
