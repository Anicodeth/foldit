// src/commands/integrateShadcnUi.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { installPackages } from "../utils/packageManager";

interface IntegrateShadcnUiOptions {
  components?: string;
  theme?: string;
  dir?: string;
  tailwind?: boolean;
}

/**
 * Integrates shadcn/ui into the project.
 * @param options Configuration options for shadcn/ui setup
 */
export async function integrateShadcnUi(
  options: IntegrateShadcnUiOptions = {}
) {
  const cwd = process.cwd();
  const theme = options.theme || "zinc";
  const componentsDir = options.dir || "src/components/ui";

  console.log("🎨 Setting up shadcn/ui...");

  // Create components directory
  await fs.mkdir(componentsDir, { recursive: true });
  console.log(`✅ Created ${componentsDir}`);

  // Generate components.json configuration
  const componentsConfig = generateComponentsConfig(componentsDir, theme);
  const componentsConfigPath = path.join(cwd, "components.json");
  await fs.writeFile(componentsConfigPath, componentsConfig, { flag: "wx" });
  console.log("✅ Created components.json");

  // Generate globals.css with Tailwind directives
  const globalsCss = generateGlobalsCss(theme);
  const globalsCssPath = path.join(cwd, "src/app/globals.css");

  if (existsSync(globalsCssPath)) {
    const existingCss = await fs.readFile(globalsCssPath, "utf-8");
    if (!existingCss.includes("@tailwind base")) {
      await fs.writeFile(globalsCssPath, globalsCss + "\n" + existingCss);
      console.log("✅ Updated src/app/globals.css with Tailwind directives");
    } else {
      console.log("ℹ️  Tailwind directives already exist in globals.css");
    }
  } else {
    await fs.mkdir(path.dirname(globalsCssPath), { recursive: true });
    await fs.writeFile(globalsCssPath, globalsCss, { flag: "wx" });
    console.log("✅ Created src/app/globals.css");
  }

  // Generate Tailwind config
  const tailwindConfig = generateTailwindConfig();
  const tailwindConfigPath = path.join(cwd, "tailwind.config.js");
  await fs.writeFile(tailwindConfigPath, tailwindConfig, { flag: "wx" });
  console.log("✅ Created tailwind.config.js");

  // Generate PostCSS config
  const postcssConfig = generatePostcssConfig();
  const postcssConfigPath = path.join(cwd, "postcss.config.js");
  await fs.writeFile(postcssConfigPath, postcssConfig, { flag: "wx" });
  console.log("✅ Created postcss.config.js");

  // Generate utility functions
  const utilsPath = path.join(cwd, "src/lib/utils.ts");
  const utilsContent = generateUtilsContent();
  await fs.writeFile(utilsPath, utilsContent, { flag: "wx" });
  console.log("✅ Created src/lib/utils.ts");

  // Generate specific components if requested
  if (options.components) {
    await generateComponents(options.components, componentsDir);
  }

  // Update package.json with dependencies
  await updatePackageJson(options);

  // Install dependencies
  console.log("\n📦 Installing dependencies...");
  try {
    const packages = [
      "tailwindcss-animate",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
    ];

    if (options.tailwind) {
      await installPackages(["tailwindcss", "postcss", "autoprefixer"], true);
    }

    await installPackages(packages);
  } catch (error) {
    console.log(
      "⚠️  Failed to install dependencies automatically. Please run manually:"
    );
    console.log(
      "npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react"
    );
    if (options.tailwind) {
      console.log("npm install -D tailwindcss postcss autoprefixer");
    }
  }

  // Initialize Tailwind CSS if requested
  if (options.tailwind) {
    console.log("\n🔧 Initializing Tailwind CSS...");
    try {
      const { execSync } = require("child_process");
      execSync("npx tailwindcss init -p", { stdio: "inherit" });
      console.log("✅ Tailwind CSS initialized successfully");
    } catch (error) {
      console.log(
        "⚠️  Failed to initialize Tailwind CSS. Please run manually: npx tailwindcss init -p"
      );
    }
  }

  console.log("\n🎉 shadcn/ui integration complete!");
  console.log("\n📚 Next steps:");
  console.log("1. Add components with: npx shadcn@latest add <component-name>");
  console.log("2. Customize your theme in globals.css");
  console.log("3. Import components from your ui directory");
}

function generateComponentsConfig(
  componentsDir: string,
  theme: string
): string {
  return `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "${theme}",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "${componentsDir}",
    "utils": "src/lib/utils"
  }
}`;
}

function generateGlobalsCss(theme: string): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;
}

function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
}

function generateUtilsContent(): string {
  return `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
}

async function generateComponents(
  componentsList: string,
  componentsDir: string
) {
  const components = componentsList.split(",").map((c) => c.trim());

  for (const component of components) {
    const componentPath = path.join(componentsDir, `${component}.tsx`);
    const componentContent = generateComponentTemplate(component);
    await fs.writeFile(componentPath, componentContent, { flag: "wx" });
    console.log(`✅ Created ${component}.tsx`);
  }
}

function generateComponentTemplate(componentName: string): string {
  const capitalizedName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  return `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ${componentName}Variants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ${capitalizedName}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${componentName}Variants> {}

const ${capitalizedName} = React.forwardRef<HTMLDivElement, ${capitalizedName}Props>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(${componentName}Variants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
${capitalizedName}.displayName = "${capitalizedName}"

export { ${capitalizedName}, ${componentName}Variants }`;
}

async function updatePackageJson(options: IntegrateShadcnUiOptions) {
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

    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }

    // Add shadcn/ui dependencies
    packageJson.dependencies["class-variance-authority"] = "^0.7.0";
    packageJson.dependencies["clsx"] = "^2.0.0";
    packageJson.dependencies["tailwind-merge"] = "^2.0.0";
    packageJson.dependencies["lucide-react"] = "^0.294.0";

    if (options.tailwind) {
      packageJson.devDependencies["tailwindcss"] = "^3.3.0";
      packageJson.devDependencies["postcss"] = "^8.4.0";
      packageJson.devDependencies["autoprefixer"] = "^10.4.0";
    }

    packageJson.devDependencies["tailwindcss-animate"] = "^1.0.7";

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json with shadcn/ui dependencies");
  } catch (error) {
    console.log("ℹ️  Could not update package.json dependencies");
  }
}
