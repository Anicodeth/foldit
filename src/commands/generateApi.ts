// src/commands/generateApi.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generateApiRouteTemplate } from "../templates/nextApiTemplate";

interface GenerateApiOptions {
  methods?: string[];
  auth?: boolean;
  prisma?: boolean;
  dynamic?: string;
  catchAll?: boolean;
}

/**
 * Generates a new Next.js API route scaffold.
 * @param name Name of the API route (e.g., "user" for app/api/user/route.ts)
 * @param options Options for additional features
 */
export async function generateApi(
  name: string,
  options: GenerateApiOptions = {}
) {
  const cwd = process.cwd();

  // Set default methods if not provided
  const methods = options.methods || ["GET", "POST"];

  // Handle dynamic routes
  let apiDir: string;
  if (options.dynamic) {
    const dynamicSegment = options.catchAll
      ? `[...${options.dynamic}]`
      : `[${options.dynamic}]`;
    apiDir = path.join(cwd, `src/app/api/${name}/${dynamicSegment}`);
  } else {
    apiDir = path.join(cwd, `src/app/api/${name}`);
  }

  if (existsSync(apiDir)) {
    console.error(`API route '${name}' already exists at ${apiDir}`);
    process.exit(1);
  }

  await fs.mkdir(apiDir, { recursive: true });

  const routeFile = path.join(apiDir, "route.ts");

  try {
    // Generate the API route content
    const routeContent = generateApiRouteTemplate(name, methods, options);

    // Write the generated content to the file
    await fs.writeFile(routeFile, routeContent, { flag: "wx" });

    console.log(`Created API route: ${routeFile}`);
    console.log(`Supported methods: ${methods.join(", ")}`);

    if (options.auth) {
      console.log("✅ Authentication middleware included");
    }

    if (options.prisma) {
      console.log("✅ Prisma integration included");
    }

    if (options.dynamic) {
      console.log(`✅ Dynamic route with parameter: ${options.dynamic}`);
      if (options.catchAll) {
        console.log("✅ Catch-all route enabled");
      }
    }

    console.log(`API route '${name}' scaffold created!`);
  } catch (err: any) {
    console.error("Error generating API route scaffold:", err.message);
    process.exit(1);
    // In test environment, process.exit throws an error, so we need to re-throw it
    throw err;
  }
}
