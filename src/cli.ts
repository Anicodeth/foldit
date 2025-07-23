#!/usr/bin/env node

import { generatePage } from "./commands/generatePage";
import { generateStructure } from "./commands/generateStructure";
import { generateApi } from "./commands/generateApi";
import { integratePrisma } from "./commands/integratePrisma";
import { integrateNextAuth } from "./commands/integrateNextAuth";
import { integrateEslintPrettier } from "./commands/integrateEslintPrettier";
import { integrateShadcnUi } from "./commands/integrateShadcnUi";
import { integrateBetterAuth } from "./commands/integrateBetterAuth";
import { dockerize } from "./commands/dockerize";
import { addKube } from "./commands/addKube";
import { generateService } from "./commands/generateService";

const VERSION = "1.0.0";

function showHelp() {
  console.log(`
FoldIt CLI - A comprehensive package for maintaining a clean folder structure.

Usage: foldit <command> [options]

Commands:
  generate-structure [flags]      Generate a Next.js project folder structure
    --basic                      Generate basic folder structure
    --medium                     Generate medium folder structure

  generate-page <name> [flags]    Generate a new Next.js page scaffold
    -c, --component              Include a components folder
    -t, --test                   Include a test folder with test file
    -d, --dynamic <segment>      Create a dynamic route with the specified segment name
    --catch-all                  Create a catch-all dynamic route (use with -d)

  generate-api <name> [flags]     Generate a new Next.js API route scaffold
    --methods <list>             Comma-separated HTTP methods (default: GET,POST)
    --auth                       Include authentication middleware
    --prisma                     Include Prisma database integration
    -d, --dynamic <param>        Create dynamic route with parameter
    --catch-all, -c              Use catch-all dynamic route (with -d)

  generate-service <name> [flags] Generate a service file with axios for API calls
    --base-url <url>             Custom base URL for the service
    --with-types                 Generate TypeScript types file
    --with-interceptors          Include axios interceptors
    --with-error-handling        Include comprehensive error handling
    --with-auth                  Include authentication support
    --with-retry                 Include retry logic with exponential backoff
    --with-cache                 Include caching functionality

  integrate prisma [flags]        Add Prisma ORM for database access
    --db <provider>              Sets DB provider: sqlite, postgresql, mysql, etc.
    --push                       Runs prisma db push after setup
    --generate                   Runs prisma generate after setup
    --with-seed                  Adds prisma/seed.ts with basic seeding logic
    --schema <path>              Custom path to schema.prisma (default: prisma/schema.prisma)

  integrate next-auth [flags]     Set up NextAuth.js for authentication with App Router
    --provider <name>            Adds provider (e.g., github, google, credentials)
    --prisma                     Uses Prisma adapter + adds session models
    --session <jwt/database>     Sets session strategy
    --env                        Injects needed .env keys for provider setup
    --route                      Scaffolds app/api/auth/[...nextauth]/route.ts

  integrate better-auth [flags]   Set up Better Auth for modern authentication
    --provider <name>            Adds provider (e.g., github, google, credentials)
    --prisma                     Uses Prisma adapter + adds session models
    --session <jwt/database>     Sets session strategy
    --env                        Injects needed .env keys for provider setup
    --route                      Scaffolds app/api/auth/route.ts

  integrate eslint-prettier [flags] Add and configure ESLint + Prettier
    --strict                     Enables strict mode (no-any, no-unused-vars, etc.)
    --airbnb                     Adds Airbnb ESLint config
    --typescript                 Adds @typescript-eslint plugin and rules
    --with-scripts               Adds lint and format scripts in package.json
    --ignore <file>              Adds to .eslintignore or .prettierignore

  integrate shadcn/ui [flags]     Set up shadcn/ui with Tailwind + Radix + Component Generator
    --components <list>          Scaffolds specific components (e.g. button,input,dialog)
    --theme <name>               Applies a theme (default: zinc)
    --dir <path>                 Custom path to generate components (components/ui by default)
    --tailwind                   Automatically installs Tailwind CSS if missing

  dockerize [flags]              Dockerize your Next.js application
    --node-version <version>     Node.js version (default: 18-alpine)
    --port <number>              Port number (default: 3000)
    --with-compose               Generate docker-compose.yml
    --with-ignore                Generate .dockerignore
    --production                 Generate production-optimized Dockerfile

  add-kube [flags]               Add Kubernetes configuration files
    --namespace <name>           Kubernetes namespace (default: default)
    --replicas <number>          Number of replicas (default: 2)
    --port <number>              Port number (default: 3000)
    --with-ingress               Generate ingress.yaml
    --with-configmap             Generate configmap.yaml
    --image-name <name>          Docker image name (default: nextjs-app)
    --image-tag <tag>            Docker image tag (default: latest)
    --service-type <type>        Service type: ClusterIP, NodePort, LoadBalancer (default: ClusterIP)

Global Options:
  --version, -v                  Show version
  --help, -h                     Show this help message

Examples:
  foldit generate-page about
  foldit generate-page user-profile -c
  foldit generate-page blog -t
  foldit generate-page dashboard -c -t
  foldit generate-page blog -d slug -t
  foldit generate-page shop -d slug --catch-all -t
  foldit generate-structure --basic
  foldit generate-structure --medium
  foldit generate-api user
  foldit generate-api posts --methods GET,POST,PUT,DELETE
  foldit generate-api auth --auth --methods POST
  foldit generate-api products --prisma --methods GET,POST
  foldit generate-api user -d id --auth --prisma
  foldit generate-api files -d path --catch-all --methods GET,POST
  foldit generate-service user --with-types --with-auth --with-cache
  foldit generate-service posts --with-interceptors --with-retry
  foldit integrate prisma --db postgresql --with-seed
  foldit integrate next-auth --provider github --prisma --env --route
  foldit integrate better-auth --provider google --prisma --env --route
  foldit integrate eslint-prettier --strict --typescript --with-scripts
  foldit integrate shadcn/ui --components button,input,dialog --theme zinc
  foldit dockerize --with-compose --production
  foldit dockerize --node-version 20-alpine --port 8080
  foldit add-kube --with-ingress --with-configmap --replicas 3
  foldit add-kube --namespace production --service-type LoadBalancer
`);
}

function showVersion() {
  console.log(`FoldIt CLI v${VERSION}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case "generate-page":
      if (args.length < 2) {
        console.error("Error: Page name is required");
        console.log("Usage: foldit generate-page <name> [flags]");
        process.exit(1);
      }

      const pageName = args[1];
      const flags = args.slice(2);

      // Parse flags
      const options: any = {
        withComponent: flags.includes("-c") || flags.includes("--component"),
        withTest: flags.includes("-t") || flags.includes("--test"),
        catchAll: flags.includes("--catch-all"),
      };

      // Parse dynamic route segment
      const dynamicIndex = flags.findIndex(
        (flag) => flag === "-d" || flag === "--dynamic"
      );
      if (dynamicIndex !== -1 && dynamicIndex + 1 < flags.length) {
        options.dynamic = flags[dynamicIndex + 1];
      }

      try {
        await generatePage(pageName, options);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      break;

    case "generate-structure":
      const structureFlags = args.slice(1);

      // Parse structure type
      let structureType: "next" | "react" | "node" | null = null;
      if (structureFlags.includes("--next")) {
        structureType = "next";
      } else if (structureFlags.includes("--react")) {
        structureType = "react";
      } else if (structureFlags.includes("--node")) {
        structureType = "node";
      }

      if (!structureType) {
        console.error("Error: Structure type is required");
        console.log(
          "Usage: foldit generate-structure --next OR foldit generate-structure --react OR foldit generate-structure --node"
        );
        process.exit(1);
      }

      try {
        await generateStructure({ type: structureType });
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      break;

    case "generate-api":
      if (args.length < 2) {
        console.error("Error: API route name is required");
        console.log("Usage: foldit generate-api <name> [flags]");
        process.exit(1);
      }

      const apiName = args[1];
      const apiFlags = args.slice(2);

      // Parse API flags
      const apiOptions: any = {
        auth: apiFlags.includes("--auth"),
        prisma: apiFlags.includes("--prisma"),
        catchAll: apiFlags.includes("--catch-all") || apiFlags.includes("-c"),
      };

      // Parse methods
      const methodsIndex = apiFlags.findIndex((flag) => flag === "--methods");
      if (methodsIndex !== -1 && methodsIndex + 1 < apiFlags.length) {
        apiOptions.methods = apiFlags[methodsIndex + 1]
          .split(",")
          .map((m) => m.trim().toUpperCase());
      }

      // Parse dynamic route parameter
      const apiDynamicIndex = apiFlags.findIndex(
        (flag) => flag === "-d" || flag === "--dynamic"
      );
      if (apiDynamicIndex !== -1 && apiDynamicIndex + 1 < apiFlags.length) {
        apiOptions.dynamic = apiFlags[apiDynamicIndex + 1];
      }

      try {
        await generateApi(apiName, apiOptions);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      break;

    case "dockerize":
      const dockerFlags = args.slice(1);

      try {
        const dockerOptions: any = {
          withCompose: dockerFlags.includes("--with-compose"),
          withIgnore: !dockerFlags.includes("--no-ignore"),
          production: dockerFlags.includes("--production"),
        };

        // Parse node version
        const nodeVersionIndex = dockerFlags.findIndex(
          (flag) => flag === "--node-version"
        );
        if (
          nodeVersionIndex !== -1 &&
          nodeVersionIndex + 1 < dockerFlags.length
        ) {
          dockerOptions.nodeVersion = dockerFlags[nodeVersionIndex + 1];
        }

        // Parse port
        const portIndex = dockerFlags.findIndex((flag) => flag === "--port");
        if (portIndex !== -1 && portIndex + 1 < dockerFlags.length) {
          dockerOptions.port = parseInt(dockerFlags[portIndex + 1]);
        }

        await dockerize(dockerOptions);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      break;

    case "add-kube":
      const kubeFlags = args.slice(1);

      try {
        const kubeOptions: any = {
          withIngress: kubeFlags.includes("--with-ingress"),
          withConfigMap: kubeFlags.includes("--with-configmap"),
        };

        // Parse namespace
        const namespaceIndex = kubeFlags.findIndex(
          (flag) => flag === "--namespace"
        );
        if (namespaceIndex !== -1 && namespaceIndex + 1 < kubeFlags.length) {
          kubeOptions.namespace = kubeFlags[namespaceIndex + 1];
        }

        // Parse replicas
        const replicasIndex = kubeFlags.findIndex(
          (flag) => flag === "--replicas"
        );
        if (replicasIndex !== -1 && replicasIndex + 1 < kubeFlags.length) {
          kubeOptions.replicas = parseInt(kubeFlags[replicasIndex + 1]);
        }

        // Parse port
        const portIndex = kubeFlags.findIndex((flag) => flag === "--port");
        if (portIndex !== -1 && portIndex + 1 < kubeFlags.length) {
          kubeOptions.port = parseInt(kubeFlags[portIndex + 1]);
        }

        // Parse image name
        const imageNameIndex = kubeFlags.findIndex(
          (flag) => flag === "--image-name"
        );
        if (imageNameIndex !== -1 && imageNameIndex + 1 < kubeFlags.length) {
          kubeOptions.imageName = kubeFlags[imageNameIndex + 1];
        }

        // Parse image tag
        const imageTagIndex = kubeFlags.findIndex(
          (flag) => flag === "--image-tag"
        );
        if (imageTagIndex !== -1 && imageTagIndex + 1 < kubeFlags.length) {
          kubeOptions.imageTag = kubeFlags[imageTagIndex + 1];
        }

        // Parse service type
        const serviceTypeIndex = kubeFlags.findIndex(
          (flag) => flag === "--service-type"
        );
        if (
          serviceTypeIndex !== -1 &&
          serviceTypeIndex + 1 < kubeFlags.length
        ) {
          kubeOptions.serviceType = kubeFlags[serviceTypeIndex + 1];
        }

        await addKube(kubeOptions);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      break;

    case "generate-service":
      if (args.length < 2) {
        console.error("Error: Service name is required");
        console.log("Usage: foldit generate-service <name> [flags]");
        process.exit(1);
      }

      const serviceName = args[1];
      const serviceFlags = args.slice(2);

      try {
        const serviceOptions: any = {
          withTypes: serviceFlags.includes("--with-types"),
          withInterceptors: serviceFlags.includes("--with-interceptors"),
          withErrorHandling: serviceFlags.includes("--with-error-handling"),
          withAuth: serviceFlags.includes("--with-auth"),
          withRetry: serviceFlags.includes("--with-retry"),
          withCache: serviceFlags.includes("--with-cache"),
        };

        // Parse base URL
        const baseUrlIndex = serviceFlags.findIndex(
          (flag) => flag === "--base-url"
        );
        if (baseUrlIndex !== -1 && baseUrlIndex + 1 < serviceFlags.length) {
          serviceOptions.baseUrl = serviceFlags[baseUrlIndex + 1];
        }

        await generateService(serviceName, serviceOptions);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      break;

    case "integrate":
      if (args.length < 2) {
        console.error("Error: Integration type is required");
        console.log("Usage: foldit integrate <type> [flags]");
        console.log(
          "Available types: prisma, next-auth, better-auth, eslint-prettier, shadcn/ui"
        );
        process.exit(1);
      }

      const integrationType = args[1];
      const integrationFlags = args.slice(2);

      try {
        switch (integrationType) {
          case "prisma":
            await handlePrismaIntegration(integrationFlags);
            break;
          case "next-auth":
            await handleNextAuthIntegration(integrationFlags);
            break;
          case "better-auth":
            await handleBetterAuthIntegration(integrationFlags);
            break;
          case "eslint-prettier":
            await handleEslintPrettierIntegration(integrationFlags);
            break;
          case "shadcn/ui":
          case "shadcn":
            await handleShadcnUiIntegration(integrationFlags);
            break;
          default:
            console.error(`Unknown integration type: ${integrationType}`);
            console.log(
              "Available types: prisma, next-auth, better-auth, eslint-prettier, shadcn/ui"
            );
            process.exit(1);
        }
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      break;

    case "--version":
    case "-v":
      showVersion();
      break;

    case "--help":
    case "-h":
      showHelp();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Integration handlers
async function handlePrismaIntegration(flags: string[]) {
  const options: any = {
    push: flags.includes("--push"),
    generate: flags.includes("--generate"),
    withSeed: flags.includes("--with-seed"),
  };

  // Parse database provider
  const dbIndex = flags.findIndex((flag) => flag === "--db");
  if (dbIndex !== -1 && dbIndex + 1 < flags.length) {
    options.db = flags[dbIndex + 1];
  }

  // Parse schema path
  const schemaIndex = flags.findIndex((flag) => flag === "--schema");
  if (schemaIndex !== -1 && schemaIndex + 1 < flags.length) {
    options.schema = flags[schemaIndex + 1];
  }

  await integratePrisma(options);
}

async function handleNextAuthIntegration(flags: string[]) {
  const options: any = {
    prisma: flags.includes("--prisma"),
    env: flags.includes("--env"),
    route: flags.includes("--route"),
  };

  // Parse provider
  const providerIndex = flags.findIndex((flag) => flag === "--provider");
  if (providerIndex !== -1 && providerIndex + 1 < flags.length) {
    options.provider = flags[providerIndex + 1];
  }

  // Parse session strategy
  const sessionIndex = flags.findIndex((flag) => flag === "--session");
  if (sessionIndex !== -1 && sessionIndex + 1 < flags.length) {
    options.session = flags[sessionIndex + 1];
  }

  await integrateNextAuth(options);
}

async function handleBetterAuthIntegration(flags: string[]) {
  const options: any = {
    prisma: flags.includes("--prisma"),
    env: flags.includes("--env"),
    route: flags.includes("--route"),
  };

  // Parse provider
  const providerIndex = flags.findIndex((flag) => flag === "--provider");
  if (providerIndex !== -1 && providerIndex + 1 < flags.length) {
    options.provider = flags[providerIndex + 1];
  }

  // Parse session strategy
  const sessionIndex = flags.findIndex((flag) => flag === "--session");
  if (sessionIndex !== -1 && sessionIndex + 1 < flags.length) {
    options.session = flags[sessionIndex + 1];
  }

  await integrateBetterAuth(options);
}

async function handleEslintPrettierIntegration(flags: string[]) {
  const options: any = {
    strict: flags.includes("--strict"),
    airbnb: flags.includes("--airbnb"),
    typescript: flags.includes("--typescript"),
    withScripts: flags.includes("--with-scripts"),
  };

  // Parse ignore file
  const ignoreIndex = flags.findIndex((flag) => flag === "--ignore");
  if (ignoreIndex !== -1 && ignoreIndex + 1 < flags.length) {
    options.ignore = flags[ignoreIndex + 1];
  }

  await integrateEslintPrettier(options);
}

async function handleShadcnUiIntegration(flags: string[]) {
  const options: any = {
    tailwind: flags.includes("--tailwind"),
  };

  // Parse components
  const componentsIndex = flags.findIndex((flag) => flag === "--components");
  if (componentsIndex !== -1 && componentsIndex + 1 < flags.length) {
    options.components = flags[componentsIndex + 1];
  }

  // Parse theme
  const themeIndex = flags.findIndex((flag) => flag === "--theme");
  if (themeIndex !== -1 && themeIndex + 1 < flags.length) {
    options.theme = flags[themeIndex + 1];
  }

  // Parse directory
  const dirIndex = flags.findIndex((flag) => flag === "--dir");
  if (dirIndex !== -1 && dirIndex + 1 < flags.length) {
    options.dir = flags[dirIndex + 1];
  }

  await integrateShadcnUi(options);
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the CLI
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
