// src/commands/integratePrisma.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generatePrismaSchemaTemplate } from "../templates/prismaSchemaTemplate";
import { generatePrismaClientTemplate } from "../templates/prismaClientTemplate";
import { generatePrismaSeedTemplate } from "../templates/prismaSeedTemplate";
import { installPackages } from "../utils/packageManager";

interface IntegratePrismaOptions {
  db?: string;
  push?: boolean;
  generate?: boolean;
  withSeed?: boolean;
  schema?: string;
}

/**
 * Integrates Prisma ORM into the project.
 * @param options Configuration options for Prisma setup
 */
export async function integratePrisma(options: IntegratePrismaOptions = {}) {
  const cwd = process.cwd();
  const dbProvider = options.db || "sqlite";
  const schemaPath = options.schema || "prisma/schema.prisma";
  const prismaDir = path.dirname(schemaPath);

  console.log("🔧 Setting up Prisma ORM...");

  // Create prisma directory
  await fs.mkdir(prismaDir, { recursive: true });

  // Generate schema.prisma
  const schemaContent = generatePrismaSchemaTemplate(dbProvider);
  await fs.writeFile(schemaPath, schemaContent, { flag: "wx" });
  console.log(`✅ Created ${schemaPath}`);

  // Create .env with DATABASE_URL
  const envPath = path.join(cwd, ".env");
  const envContent = generateEnvTemplate(dbProvider);

  if (existsSync(envPath)) {
    // Append to existing .env
    const existingEnv = await fs.readFile(envPath, "utf-8");
    if (!existingEnv.includes("DATABASE_URL")) {
      await fs.appendFile(envPath, `\n${envContent}`);
      console.log("✅ Added DATABASE_URL to existing .env");
    } else {
      console.log("ℹ️  DATABASE_URL already exists in .env");
    }
  } else {
    await fs.writeFile(envPath, envContent);
    console.log("✅ Created .env with DATABASE_URL");
  }

  // Create lib/prisma.ts
  const libDir = path.join(cwd, "src/lib");
  await fs.mkdir(libDir, { recursive: true });

  const prismaClientPath = path.join(libDir, "prisma.ts");
  const prismaClientContent = generatePrismaClientTemplate();
  await fs.writeFile(prismaClientPath, prismaClientContent, { flag: "wx" });
  console.log("✅ Created src/lib/prisma.ts");

  // Generate seed file if requested
  if (options.withSeed) {
    const seedPath = path.join(prismaDir, "seed.ts");
    const seedContent = generatePrismaSeedTemplate();
    await fs.writeFile(seedPath, seedContent, { flag: "wx" });
    console.log("✅ Created prisma/seed.ts");
  }

  // Update package.json with Prisma scripts
  await updatePackageJson();

  // Install dependencies
  console.log("\n📦 Installing dependencies...");
  try {
    await installPackages(["prisma", "@prisma/client"]);

    if (options.withSeed) {
      await installPackages(["tsx"], true);
    }
  } catch (error) {
    console.log(
      "⚠️  Failed to install dependencies automatically. Please run manually:"
    );
    console.log("npm install prisma @prisma/client");
    if (options.withSeed) {
      console.log("npm install --save-dev tsx");
    }
  }

  // Run Prisma commands if requested
  if (options.push) {
    console.log("\n🚀 Running: npx prisma db push");
    try {
      const { execSync } = require("child_process");
      execSync("npx prisma db push", { stdio: "inherit" });
      console.log("✅ Database schema pushed successfully");
    } catch (error) {
      console.log(
        "⚠️  Failed to run prisma db push. Please run manually: npx prisma db push"
      );
    }
  }

  if (options.generate) {
    console.log("\n🔧 Running: npx prisma generate");
    try {
      const { execSync } = require("child_process");
      execSync("npx prisma generate", { stdio: "inherit" });
      console.log("✅ Prisma client generated successfully");
    } catch (error) {
      console.log(
        "⚠️  Failed to run prisma generate. Please run manually: npx prisma generate"
      );
    }
  }

  console.log("\n🎉 Prisma integration complete!");
}

function generateEnvTemplate(dbProvider: string): string {
  const templates = {
    sqlite: 'DATABASE_URL="file:./dev.db"',
    postgresql:
      'DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"',
    mysql: 'DATABASE_URL="mysql://username:password@localhost:3306/mydb"',
    sqlserver:
      'DATABASE_URL="sqlserver://localhost:1433;database=mydb;user=sa;password=password;trustServerCertificate=true"',
    mongodb: 'DATABASE_URL="mongodb://localhost:27017/mydb"',
  };

  return templates[dbProvider as keyof typeof templates] || templates.sqlite;
}

async function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!existsSync(packageJsonPath)) {
    console.log("ℹ️  package.json not found, skipping script updates");
    return;
  }

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add Prisma scripts
    packageJson.scripts["db:generate"] = "prisma generate";
    packageJson.scripts["db:push"] = "prisma db push";
    packageJson.scripts["db:migrate"] = "prisma migrate dev";
    packageJson.scripts["db:studio"] = "prisma studio";
    packageJson.scripts["db:seed"] = "tsx prisma/seed.ts";

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json with Prisma scripts");
  } catch (error) {
    console.log("ℹ️  Could not update package.json scripts");
  }
}
