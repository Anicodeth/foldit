// src/commands/integrateEslintPrettier.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { installPackages } from "../utils/packageManager";

interface IntegrateEslintPrettierOptions {
  strict?: boolean;
  airbnb?: boolean;
  typescript?: boolean;
  withScripts?: boolean;
  ignore?: string;
}

/**
 * Integrates ESLint and Prettier into the project.
 * @param options Configuration options for ESLint and Prettier setup
 */
export async function integrateEslintPrettier(
  options: IntegrateEslintPrettierOptions = {}
) {
  const cwd = process.cwd();

  console.log("🔧 Setting up ESLint and Prettier...");

  // Generate ESLint configuration
  const eslintConfig = generateEslintConfig(options);
  const eslintPath = path.join(cwd, ".eslintrc.js");
  await fs.writeFile(eslintPath, eslintConfig, { flag: "wx" });
  console.log("✅ Created .eslintrc.js");

  // Generate Prettier configuration
  const prettierConfig = generatePrettierConfig();
  const prettierPath = path.join(cwd, ".prettierrc");
  await fs.writeFile(prettierPath, prettierConfig, { flag: "wx" });
  console.log("✅ Created .prettierrc");

  // Generate ignore files
  const eslintIgnore = generateEslintIgnore(options.ignore);
  const eslintIgnorePath = path.join(cwd, ".eslintignore");
  await fs.writeFile(eslintIgnorePath, eslintIgnore, { flag: "wx" });
  console.log("✅ Created .eslintignore");

  const prettierIgnore = generatePrettierIgnore(options.ignore);
  const prettierIgnorePath = path.join(cwd, ".prettierignore");
  await fs.writeFile(prettierIgnorePath, prettierIgnore, { flag: "wx" });
  console.log("✅ Created .prettierignore");

  // Update package.json with scripts and dependencies
  if (options.withScripts) {
    await updatePackageJson(options);
  }

  // Install dependencies
  console.log("\n📦 Installing dependencies...");
  try {
    const packages = ["eslint", "prettier"];

    if (options.typescript) {
      packages.push(
        "@typescript-eslint/parser",
        "@typescript-eslint/eslint-plugin"
      );
    }

    if (options.airbnb) {
      packages.push(
        "eslint-config-airbnb",
        "eslint-config-airbnb-typescript",
        "eslint-plugin-import",
        "eslint-plugin-jsx-a11y",
        "eslint-plugin-react",
        "eslint-plugin-react-hooks"
      );
    }

    await installPackages(packages, true);
  } catch (error) {
    console.log(
      "⚠️  Failed to install dependencies automatically. Please run manually:"
    );
    console.log("npm install --save-dev eslint prettier");
    if (options.typescript) {
      console.log(
        "npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin"
      );
    }
    if (options.airbnb) {
      console.log(
        "npm install --save-dev eslint-config-airbnb eslint-config-airbnb-typescript eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks"
      );
    }
  }

  console.log("\n🎉 ESLint and Prettier integration complete!");
}

function generateEslintConfig(options: IntegrateEslintPrettierOptions): string {
  let config = `module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [`;

  if (options.airbnb) {
    if (options.typescript) {
      config += `
    'airbnb-typescript/base',`;
    } else {
      config += `
    'airbnb-base',`;
    }
  } else {
    config += `
    'eslint:recommended',`;
  }

  if (options.typescript) {
    config += `
    '@typescript-eslint/recommended',`;
  }

  config += `
  ],
  parser: ${
    options.typescript
      ? "'@typescript-eslint/parser'"
      : "'@babel/eslint-parser'"
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',`;

  if (options.typescript) {
    config += `
    project: './tsconfig.json',`;
  }

  config += `
  },
  plugins: [`;

  if (options.typescript) {
    config += `
    '@typescript-eslint',`;
  }

  if (options.airbnb) {
    config += `
    'import',
    'jsx-a11y',
    'react',
    'react-hooks',`;
  }

  config += `
  ],
  rules: {`;

  if (options.strict) {
    config += `
    'no-any': 'error',
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',`;
  }

  if (options.typescript) {
    config += `
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',`;
  }

  config += `
  },
  settings: {`;

  if (options.airbnb) {
    config += `
    react: {
      version: 'detect',
    },`;
  }

  config += `
  },
};`;

  return config;
}

function generatePrettierConfig(): string {
  return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}`;
}

function generateEslintIgnore(ignore?: string): string {
  let content = `node_modules/
dist/
build/
.next/
out/
coverage/
*.min.js
*.bundle.js`;

  if (ignore) {
    content += `\n${ignore}`;
  }

  return content;
}

function generatePrettierIgnore(ignore?: string): string {
  let content = `node_modules/
dist/
build/
.next/
out/
coverage/
*.min.js
*.bundle.js
package-lock.json
yarn.lock
pnpm-lock.yaml`;

  if (ignore) {
    content += `\n${ignore}`;
  }

  return content;
}

async function updatePackageJson(options: IntegrateEslintPrettierOptions) {
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

    // Add lint and format scripts
    packageJson.scripts["lint"] = "eslint . --ext .js,.jsx,.ts,.tsx";
    packageJson.scripts["lint:fix"] = "eslint . --ext .js,.jsx,.ts,.tsx --fix";
    packageJson.scripts["format"] = "prettier --write .";
    packageJson.scripts["format:check"] = "prettier --check .";

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json with lint and format scripts");
  } catch (error) {
    console.log("ℹ️  Could not update package.json scripts");
  }
}
