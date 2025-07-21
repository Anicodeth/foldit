// src/commands/generateStructure.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { getStructureConfig } from "../templates/structureTemplate";

interface GenerateStructureOptions {
  type: "basic" | "medium";
}

/**
 * Creates a directory and adds a .gitkeep file to ensure it's tracked by git
 */
async function createDirectoryWithGitkeep(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(path.join(dirPath, ".gitkeep"), "");
  console.log(`Created directory: ${dirPath}`);
}

/**
 * Generates a Next.js project folder structure.
 * @param options Options for the structure type
 */
export async function generateStructure(
  options: GenerateStructureOptions
): Promise<void> {
  const cwd = process.cwd();

  // Check if src directory already exists
  const srcDir = path.join(cwd, "src");
  if (existsSync(srcDir)) {
    console.warn(
      "⚠️  Warning: 'src' directory already exists. Some folders may already be present."
    );
  }

  try {
    const structureConfig = getStructureConfig(options.type);

    // Create all directories
    for (const dir of structureConfig.directories) {
      await createDirectoryWithGitkeep(path.join(cwd, dir));
    }

    console.log(
      `✅ ${
        options.type.charAt(0).toUpperCase() + options.type.slice(1)
      } folder structure created successfully!`
    );
    console.log(`\n📁 Generated ${options.type} folder structure:`);
    console.log("   All directories include .gitkeep files for git tracking");
    console.log(`\n📋 ${structureConfig.description}`);
  } catch (err: any) {
    console.error("Error generating folder structure:", err.message);
    process.exit(1);
    // In test environment, process.exit throws an error, so we need to re-throw it
    throw err;
  }
}
