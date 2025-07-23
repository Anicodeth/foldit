// src/commands/integrateBetterAuth.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generateBetterAuthConfigTemplate } from "../templates/betterAuthConfigTemplate";
import { generateBetterAuthRouteTemplate } from "../templates/betterAuthRouteTemplate";
import { generateBetterAuthPrismaAdapterTemplate } from "../templates/betterAuthPrismaAdapterTemplate";
import { installPackages } from "../utils/packageManager";

interface IntegrateBetterAuthOptions {
  provider?: string;
  prisma?: boolean;
  session?: "jwt" | "database";
  env?: boolean;
  route?: boolean;
}

/**
 * Integrates Better Auth into the project.
 * @param options Configuration options for Better Auth setup
 */
export async function integrateBetterAuth(
  options: IntegrateBetterAuthOptions = {}
) {
  const cwd = process.cwd();
  const sessionStrategy = options.session || "jwt";

  console.log("🔐 Setting up Better Auth...");

  // Create auth configuration
  const authConfigPath = path.join(cwd, "src/lib/auth.ts");
  const authConfigContent = generateBetterAuthConfigTemplate(options);
  await fs.writeFile(authConfigPath, authConfigContent, { flag: "wx" });
  console.log("✅ Created src/lib/auth.ts");

  // Create API route if requested
  if (options.route) {
    const apiAuthDir = path.join(cwd, "src/app/api/auth");
    await fs.mkdir(apiAuthDir, { recursive: true });

    const routePath = path.join(apiAuthDir, "route.ts");
    const routeContent = generateBetterAuthRouteTemplate();
    await fs.writeFile(routePath, routeContent, { flag: "wx" });
    console.log("✅ Created src/app/api/auth/route.ts");
  }

  // Add Prisma adapter and models if requested
  if (options.prisma) {
    await addPrismaAdapter();
  }

  // Add environment variables if requested
  if (options.env) {
    await addEnvironmentVariables(options);
  }

  // Update package.json with Better Auth dependency
  await updatePackageJson();

  // Install dependencies
  console.log("\n📦 Installing dependencies...");
  try {
    const packages = ["@auth/core"];

    if (options.prisma) {
      packages.push("@auth/prisma-adapter");
    }

    // Add provider-specific packages
    if (options.provider) {
      switch (options.provider.toLowerCase()) {
        case "github":
          packages.push("@auth/github-provider");
          break;
        case "google":
          packages.push("@auth/google-provider");
          break;
        case "discord":
          packages.push("@auth/discord-provider");
          break;
      }
    }

    await installPackages(packages);
  } catch (error) {
    console.log(
      "⚠️  Failed to install dependencies automatically. Please run manually:"
    );
    console.log("npm install @auth/core");
    if (options.prisma) {
      console.log("npm install @auth/prisma-adapter");
    }
  }

  console.log("\n🎉 Better Auth integration complete!");
}

async function addPrismaAdapter() {
  const cwd = process.cwd();

  // Create Prisma adapter file
  const adapterPath = path.join(cwd, "src/lib/prisma-adapter.ts");
  const adapterContent = generateBetterAuthPrismaAdapterTemplate();
  await fs.writeFile(adapterPath, adapterContent, { flag: "wx" });
  console.log("✅ Created src/lib/prisma-adapter.ts");

  // Add Prisma models to schema.prisma
  const schemaPath = path.join(cwd, "prisma/schema.prisma");
  if (existsSync(schemaPath)) {
    await addPrismaModels(schemaPath);
  } else {
    console.log(
      "ℹ️  prisma/schema.prisma not found. Add the following models manually:"
    );
    console.log(getPrismaModelsTemplate());
  }
}

async function addPrismaModels(schemaPath: string) {
  try {
    const schemaContent = await fs.readFile(schemaPath, "utf-8");
    const modelsToAdd = getPrismaModelsTemplate();

    // Check if models already exist
    if (schemaContent.includes("model Account")) {
      console.log("ℹ️  Better Auth models already exist in schema.prisma");
      return;
    }

    // Add models at the end of the file
    const updatedContent = schemaContent + "\n" + modelsToAdd;
    await fs.writeFile(schemaPath, updatedContent);
    console.log("✅ Added Better Auth models to prisma/schema.prisma");
  } catch (error) {
    console.log("ℹ️  Could not update schema.prisma");
  }
}

function getPrismaModelsTemplate(): string {
  return `
// Better Auth Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}`;
}

async function addEnvironmentVariables(options: IntegrateBetterAuthOptions) {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = generateEnvVariables(options);

  if (existsSync(envPath)) {
    const existingEnv = await fs.readFile(envPath, "utf-8");
    if (!existingEnv.includes("AUTH_SECRET")) {
      await fs.appendFile(envPath, `\n${envContent}`);
      console.log("✅ Added Better Auth variables to existing .env.local");
    } else {
      console.log("ℹ️  Better Auth variables already exist in .env.local");
    }
  } else {
    await fs.writeFile(envPath, envContent);
    console.log("✅ Created .env.local with Better Auth variables");
  }
}

function generateEnvVariables(options: IntegrateBetterAuthOptions): string {
  let envContent = `# Better Auth Configuration
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"`;

  if (options.provider) {
    const provider = options.provider.toLowerCase();

    switch (provider) {
      case "github":
        envContent += `

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"`;
        break;
      case "google":
        envContent += `

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"`;
        break;
      case "discord":
        envContent += `

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"`;
        break;
      case "credentials":
        envContent += `

# Credentials Provider
# Add your own credential validation logic`;
        break;
    }
  }

  return envContent;
}

async function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!existsSync(packageJsonPath)) {
    console.log("ℹ️  package.json not found, skipping dependency updates");
    return;
  }

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }

    // Add Better Auth dependencies
    packageJson.dependencies["@auth/core"] = "^0.18.0";
    packageJson.dependencies["@auth/prisma-adapter"] = "^1.0.0";

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json with Better Auth dependencies");
  } catch (error) {
    console.log("ℹ️  Could not update package.json dependencies");
  }
}
