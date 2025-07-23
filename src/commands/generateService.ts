// src/commands/generateService.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generateServiceTemplate } from "../templates/serviceTemplate";
import { generateAxiosConfigTemplate } from "../templates/axiosConfigTemplate";
import { installPackages } from "../utils/packageManager";

interface GenerateServiceOptions {
  baseUrl?: string;
  withTypes?: boolean;
  withInterceptors?: boolean;
  withErrorHandling?: boolean;
  withAuth?: boolean;
  withRetry?: boolean;
  withCache?: boolean;
}

/**
 * Generates a service file with axios for API calls.
 * @param serviceName Name of the service
 * @param options Configuration options for the service
 */
export async function generateService(
  serviceName: string,
  options: GenerateServiceOptions = {}
): Promise<void> {
  const cwd = process.cwd();
  const servicesDir = path.join(cwd, "src", "services");

  console.log(`🔧 Generating service: ${serviceName}`);

  try {
    // Create services directory if it doesn't exist
    await fs.mkdir(servicesDir, { recursive: true });

    // Generate the service file
    const serviceContent = generateServiceTemplate(serviceName, options);
    const servicePath = path.join(servicesDir, `${serviceName}Service.ts`);
    await fs.writeFile(servicePath, serviceContent, { flag: "wx" });
    console.log(`✅ Created ${servicePath}`);

    // Generate types file if requested
    if (options.withTypes) {
      const typesContent = generateServiceTypesTemplate(serviceName);
      const typesPath = path.join(servicesDir, `${serviceName}Types.ts`);
      await fs.writeFile(typesPath, typesContent, { flag: "wx" });
      console.log(`✅ Created ${typesPath}`);
    }

    // Generate axios config if it doesn't exist
    const axiosConfigPath = path.join(servicesDir, "axiosConfig.ts");
    if (!existsSync(axiosConfigPath)) {
      const axiosConfigContent = generateAxiosConfigTemplate(options);
      await fs.writeFile(axiosConfigPath, axiosConfigContent, { flag: "wx" });
      console.log(`✅ Created ${axiosConfigPath}`);
    }

    // Install axios if not already installed
    console.log("\n📦 Installing dependencies...");
    try {
      await installPackages(["axios"]);
      if (options.withTypes) {
        await installPackages(["@types/axios"], true);
      }
    } catch (error) {
      console.log(
        "⚠️  Failed to install dependencies automatically. Please run manually:"
      );
      console.log("npm install axios");
      if (options.withTypes) {
        console.log("npm install --save-dev @types/axios");
      }
    }

    console.log(`\n🎉 Service '${serviceName}' generated successfully!`);
    console.log("\n📋 Usage example:");
    console.log(
      `import { ${serviceName}Service } from '@/services/${serviceName}Service';`
    );
    console.log(`const data = await ${serviceName}Service.getItems();`);
  } catch (error: any) {
    if (error.code === "EEXIST") {
      console.error(
        `❌ Service '${serviceName}' already exists. Use --force to overwrite.`
      );
    } else {
      console.error("❌ Error generating service:", error.message);
    }
    process.exit(1);
  }
}

function generateServiceTypesTemplate(serviceName: string): string {
  const capitalizedName =
    serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

  return `// src/services/${serviceName}Types.ts

export interface ${capitalizedName} {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Create${capitalizedName}Request {
  name: string;
  description?: string;
}

export interface Update${capitalizedName}Request {
  name?: string;
  description?: string;
}

export interface ${capitalizedName}ListResponse {
  data: ${capitalizedName}[];
  total: number;
  page: number;
  limit: number;
}

export interface ${capitalizedName}Response {
  data: ${capitalizedName};
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}`;
}
