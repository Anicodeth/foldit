// src/commands/generate-page.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generateNextPageTemplate } from "../templates/nextPageTemplate";

/**
 * Generates a new Next.js page scaffold.
 * @param name Name of the page (e.g., "about" for app/about)
 */
export async function generatePage(name: string) {
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

    console.log(`Page '${name}' scaffold created!`);
  } catch (err: any) {
    console.error("Error generating page scaffold:", err.message);
    process.exit(1);
  }
}
