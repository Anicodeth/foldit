// src/commands/dockerize.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generateDockerfileTemplate } from "../templates/dockerfileTemplate";
import { generateDockerComposeTemplate } from "../templates/dockerComposeTemplate";
import { generateDockerIgnoreTemplate } from "../templates/dockerIgnoreTemplate";

interface DockerizeOptions {
  nodeVersion?: string;
  port?: number;
  withCompose?: boolean;
  withIgnore?: boolean;
  production?: boolean;
}

/**
 * Dockerizes a Next.js project by creating Docker configuration files.
 * @param options Configuration options for Docker setup
 */
export async function dockerize(options: DockerizeOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const nodeVersion = options.nodeVersion || "18-alpine";
  const port = options.port || 3000;

  console.log("🐳 Dockerizing Next.js project...");

  // Check if package.json exists
  const packageJsonPath = path.join(cwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    console.error(
      "❌ package.json not found. Please run this command in a Node.js project directory."
    );
    process.exit(1);
  }

  try {
    // Generate Dockerfile
    const dockerfileContent = generateDockerfileTemplate({
      nodeVersion,
      port,
      production: options.production || false,
    });
    await fs.writeFile(path.join(cwd, "Dockerfile"), dockerfileContent, {
      flag: "wx",
    });
    console.log("✅ Created Dockerfile");

    // Generate .dockerignore
    if (options.withIgnore !== false) {
      const dockerIgnoreContent = generateDockerIgnoreTemplate();
      await fs.writeFile(path.join(cwd, ".dockerignore"), dockerIgnoreContent, {
        flag: "wx",
      });
      console.log("✅ Created .dockerignore");
    }

    // Generate docker-compose.yml
    if (options.withCompose) {
      const dockerComposeContent = generateDockerComposeTemplate({
        port,
        production: options.production || false,
      });
      await fs.writeFile(
        path.join(cwd, "docker-compose.yml"),
        dockerComposeContent,
        { flag: "wx" }
      );
      console.log("✅ Created docker-compose.yml");
    }

    console.log("\n🎉 Docker configuration complete!");
    console.log("\n📋 Next steps:");
    console.log("   • Build image: docker build -t your-app .");
    console.log("   • Run container: docker run -p 3000:3000 your-app");

    if (options.withCompose) {
      console.log("   • Or use Docker Compose: docker-compose up");
    }
  } catch (error: any) {
    if (error.code === "EEXIST") {
      console.error("❌ Docker files already exist. Use --force to overwrite.");
    } else {
      console.error("❌ Error creating Docker files:", error.message);
    }
    process.exit(1);
  }
}
