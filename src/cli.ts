#!/usr/bin/env node

import { generatePage } from "./commands/generatePage";

const VERSION = "1.0.0";

function showHelp() {
  console.log(`
FoldIt CLI - A comprehensive package for maintaining a clean folder structure.

Usage: foldit <command> [options]

Commands:
  generate-page <name>    Generate a new Next.js page scaffold
  --version, -v          Show version
  --help, -h             Show this help message

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
        console.log("Usage: foldit generate-page <name>");
        process.exit(1);
      }
      const pageName = args[1];
      try {
        await generatePage(pageName);
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
