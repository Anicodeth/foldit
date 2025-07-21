#!/usr/bin/env node

import { generatePage } from "./commands/generatePage";

const VERSION = "1.0.0";

function showHelp() {
  console.log(`
FoldIt CLI - A comprehensive package for maintaining a clean folder structure.

Usage: foldit <command> [options]

Commands:
  generate-page <name> [flags]    Generate a new Next.js page scaffold
    -c, --component              Include a components folder
    -t, --test                   Include a test folder with test file
    -d, --dynamic <segment>      Create a dynamic route with the specified segment name
    --catch-all                  Create a catch-all dynamic route (use with -d)

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
