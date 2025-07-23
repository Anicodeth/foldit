// src/commands/generateStructure.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import {
  getStructureConfig,
  generateDirectoryStructure,
  StructureConfig,
  DirectoryStructure,
} from "../templates/structureTemplate";

interface GenerateStructureOptions {
  type?: "next" | "react" | "node";
  features?: string[];
  database?: string;
  auth?: string;
  styling?: string;
  testing?: boolean;
  linting?: boolean;
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
 * Recursively creates directory structure and files
 */
async function createStructureRecursive(
  structure: DirectoryStructure,
  basePath: string
): Promise<void> {
  for (const [name, item] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);

    if (item.type === "directory") {
      await createDirectoryWithGitkeep(fullPath);

      if (item.children) {
        await createStructureRecursive(item.children, fullPath);
      }
    } else if (item.type === "file" && item.content) {
      await fs.writeFile(fullPath, item.content, { flag: "wx" });
      console.log(`Created file: ${fullPath}`);
    }
  }
}

/**
 * Generates a project folder structure.
 * @param options Options for the structure configuration
 */
export async function generateStructure(
  options: GenerateStructureOptions = {}
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
    const structureConfig = getStructureConfig(options);
    const directoryStructure = generateDirectoryStructure(structureConfig);

    console.log(`🔧 Generating ${structureConfig.type} project structure...`);

    // Create the directory structure
    await createStructureRecursive(directoryStructure, cwd);

    console.log(
      `✅ ${structureConfig.type} folder structure created successfully!`
    );
    console.log(`\n📁 Generated ${structureConfig.type} project structure:`);
    console.log(`   Type: ${structureConfig.type}`);
    console.log(`   Features: ${structureConfig.features.join(", ")}`);
    if (structureConfig.database) {
      console.log(`   Database: ${structureConfig.database}`);
    }
    if (structureConfig.auth) {
      console.log(`   Auth: ${structureConfig.auth}`);
    }
    if (structureConfig.styling) {
      console.log(`   Styling: ${structureConfig.styling}`);
    }
    console.log(`   Testing: ${structureConfig.testing ? "Yes" : "No"}`);
    console.log(`   Linting: ${structureConfig.linting ? "Yes" : "No"}`);
  } catch (err: any) {
    console.error("Error generating folder structure:", err.message);
    process.exit(1);
    // In test environment, process.exit throws an error, so we need to re-throw it
    throw err;
  }
}
