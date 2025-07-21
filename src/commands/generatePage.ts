// src/commands/generate-page.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import {
  generateNextPageTemplate,
  generateDynamicRouteTemplate,
} from "../templates/nextPageTemplate";
import {
  generateNextPageTestTemplate,
  generateDynamicRouteTestTemplate,
} from "../templates/nextPageTestTemplate";

interface GeneratePageOptions {
  withComponent?: boolean;
  withTest?: boolean;
  dynamic?: string; // Dynamic segment name (e.g., "id", "slug")
  catchAll?: boolean; // Whether this is a catch-all segment
}

/**
 * Extracts the page name from a path (e.g., "cars/car" -> "car")
 */
function extractPageName(name: string): string {
  return name.split("/").pop() || name;
}

/**
 * Generates a component folder structure for a page
 */
async function generateComponentFolder(cwd: string, pageName: string) {
  const componentDir = path.join(cwd, `src/components/${pageName}`);
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
async function generateTestFolder(
  pageDir: string,
  pageName: string,
  options: GeneratePageOptions = {}
) {
  const testDir = path.join(pageDir, "__tests__");
  await fs.mkdir(testDir, { recursive: true });

  // Create a test file for the page using the appropriate template function
  let testContent: string;
  if (options.dynamic) {
    testContent = generateDynamicRouteTestTemplate(
      pageName,
      options.dynamic,
      options.catchAll
    );
  } else {
    testContent = generateNextPageTestTemplate(pageName);
  }

  await fs.writeFile(path.join(testDir, "page.test.tsx"), testContent);
  console.log(`Created test folder: ${testDir}`);
}

/**
 * Generates a new Next.js page scaffold.
 * @param name Name of the page (e.g., "about" for app/about, or "cars/car" for app/cars/car)
 * @param options Options for additional features
 */
export async function generatePage(
  name: string,
  options: GeneratePageOptions = {}
) {
  const cwd = process.cwd();

  // Handle dynamic routes
  let pageDir: string;
  if (options.dynamic) {
    const dynamicSegment = options.catchAll
      ? `[...${options.dynamic}]`
      : `[${options.dynamic}]`;
    pageDir = path.join(cwd, `src/app/${name}/${dynamicSegment}`);
  } else {
    pageDir = path.join(cwd, `src/app/${name}`);
  }

  // Extract the page name for template generation (last part of the path)
  const pageName = extractPageName(name);

  if (existsSync(pageDir)) {
    console.error(`Page '${name}' already exists at ${pageDir}`);
    process.exit(1);
  }

  await fs.mkdir(pageDir, { recursive: true });

  const pageFile = path.join(pageDir, "page.tsx");

  try {
    // Generate the page content using the appropriate template function
    let pageContent: string;
    if (options.dynamic) {
      pageContent = generateDynamicRouteTemplate(
        pageName,
        options.dynamic,
        options.catchAll
      );
    } else {
      pageContent = generateNextPageTemplate(pageName);
    }

    // Write the generated content to the file
    await fs.writeFile(pageFile, pageContent, { flag: "wx" });

    console.log(`Created page: ${pageFile}`);

    // Generate component folder if requested
    if (options.withComponent) {
      await generateComponentFolder(cwd, pageName);
    }

    // Generate test folder if requested
    if (options.withTest) {
      await generateTestFolder(pageDir, pageName, options);
    }

    console.log(`Page '${name}' scaffold created!`);
  } catch (err: any) {
    console.error("Error generating page scaffold:", err.message);
    process.exit(1);
    // In test environment, process.exit throws an error, so we need to re-throw it
    throw err;
  }
}
