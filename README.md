# FoldIt CLI

A powerful command-line tool for generating Next.js project structures, pages, and API routes with best practices and modern conventions.

[![npm version](https://badge.fury.io/js/fold-it.svg)](https://badge.fury.io/js/fold-it)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **📁 Project Structure Generation**: Create organized Next.js project folders with `.gitkeep` files
- **📄 Page Generation**: Generate Next.js pages with optional components and tests
- **🔗 Dynamic Routes**: Support for dynamic and catch-all route generation
- **🌐 API Route Generation**: Create API routes with authentication, Prisma integration, and HTTP methods
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
# Basic structure (app, components, lib, types, styles)
foldit generate-structure --basic

# Medium structure (includes hooks, services)
foldit generate-structure --medium
```

**Basic Structure:**

```
src/
├── app/                    # Entry point for routing
│   ├── api/                # Serverless API routes
├── components/             # Reusable UI components
├── lib/                    # Utility functions and DB clients
├── types/                  # Global TS types/interfaces
└── styles/                 # Global and modular CSS
```

**Medium Structure:**

```
src/
├── app/                    # Entry point for routing
│   ├── api/                # Serverless API routes
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and DB clients
├── services/               # Service layer (API abstractions)
├── types/                  # Global TS types/interfaces
└── styles/                 # Global and modular CSS
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

## 📋 Command Reference

### Global Options

- `--version, -v`: Show version
- `--help, -h`: Show help message

### Generate Structure

```bash
foldit generate-structure [flags]
```

**Flags:**

- `--basic`: Generate basic folder structure
- `--medium`: Generate medium folder structure

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

## 🎯 Examples

### Complete Project Setup

```bash
# 1. Generate project structure
foldit generate-structure --medium

# 2. Generate main pages
foldit generate-page home -c -t
foldit generate-page about -c
foldit generate-page blog -d slug -c -t

# 3. Generate API routes
foldit generate-api auth --auth --methods POST
foldit generate-api posts --prisma --methods GET,POST,PUT,DELETE
foldit generate-api user -d id --auth --prisma
```

### Blog Application

```bash
# Generate blog structure
foldit generate-structure --medium

# Generate blog pages
foldit generate-page blog -c -t
foldit generate-page blog -d slug -c -t
foldit generate-page admin -c -t

# Generate blog APIs
foldit generate-api posts --prisma --methods GET,POST,PUT,DELETE
foldit generate-api posts -d id --prisma --methods GET,PUT,DELETE
foldit generate-api auth --auth --methods POST
```

## 🔧 Configuration

The tool automatically detects your project structure and creates files in the appropriate locations. All generated files include:

- **TypeScript support** with proper type definitions
- **ESLint-friendly** code formatting
- **Git-ready** with `.gitkeep` files for empty directories
- **Testing setup** with Jest and React Testing Library
- **Modern Next.js conventions** following App Router patterns

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Next.js community
- Inspired by modern development practices
- Designed for developer productivity

---

**Made with ❤️ for the Next.js community**
