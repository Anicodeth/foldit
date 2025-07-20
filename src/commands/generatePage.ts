// src/commands/generate-page.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generateNextPageTemplate } from "../templates/nextPageTemplate";
import { generateNextPageTestTemplate } from "../templates/nextPageTestTemplate";

interface GeneratePageOptions {
  withComponent?: boolean;
  withTest?: boolean;
}

/**
 * Generates a component folder structure for a page
 */
async function generateComponentFolder(pageDir: string, pageName: string) {
  const componentDir = path.join(pageDir, "components");
  await fs.mkdir(componentDir, { recursive: true });

  // Create an index file for the components
  const indexContent = `// Components for ${pageName} page
// Add your component exports here
`;

  await fs.writeFile(path.join(componentDir, "index.ts"), indexContent);
  console.log(`Created components folder: ${componentDir}`);
}

/**
 * Generates a test folder structure for a page
 */
async function generateTestFolder(pageDir: string, pageName: string) {
  const testDir = path.join(pageDir, "__tests__");
  await fs.mkdir(testDir, { recursive: true });

  // Create a test file for the page using the template function
  const testContent = generateNextPageTestTemplate(pageName);

  await fs.writeFile(path.join(testDir, "page.test.tsx"), testContent);
  console.log(`Created test folder: ${testDir}`);
}

/**
 * Generates a new Next.js page scaffold.
 * @param name Name of the page (e.g., "about" for app/about)
 * @param options Options for additional features
 */
export async function generatePage(
  name: string,
  options: GeneratePageOptions = {}
) {
  const cwd = process.cwd();
  const pageDir = path.join(cwd, `src/app/${name}`);

  if (existsSync(pageDir)) {
    console.error(`Page '${name}' already exists at ${pageDir}`);
    process.exit(1);
  }

  await fs.mkdir(pageDir, { recursive: true });

  const pageFile = path.join(pageDir, "page.tsx");

  try {
    // Generate the page content using the template function
    const pageContent = generateNextPageTemplate(name);

    // Write the generated content to the file
    await fs.writeFile(pageFile, pageContent, { flag: "wx" });

    console.log(`Created page: ${pageFile}`);

    // Generate component folder if requested
    if (options.withComponent) {
      await generateComponentFolder(pageDir, name);
    }

    // Generate test folder if requested
    if (options.withTest) {
      await generateTestFolder(pageDir, name);
    }

    console.log(`Page '${name}' scaffold created!`);
  } catch (err: any) {
    console.error("Error generating page scaffold:", err.message);
    process.exit(1);
    // In test environment, process.exit throws an error, so we need to re-throw it
    throw err;
  }
}
