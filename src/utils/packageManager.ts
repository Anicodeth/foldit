import { execSync } from "child_process";
import { existsSync } from "fs";

interface PackageManager {
  install(packages: string[], isDev?: boolean): Promise<void>;
  addScripts(scripts: Record<string, string>): Promise<void>;
  addDependencies(
    dependencies: Record<string, string>,
    isDev?: boolean
  ): Promise<void>;
}

class NpmPackageManager implements PackageManager {
  async install(packages: string[], isDev: boolean = false): Promise<void> {
    if (packages.length === 0) return;

    const flag = isDev ? "--save-dev" : "--save";
    const command = `npm install ${flag} ${packages.join(" ")}`;

    try {
      console.log(`📦 Running: ${command}`);
      execSync(command, { stdio: "inherit" });
      console.log("✅ Dependencies installed successfully");
    } catch (error) {
      console.error("❌ Failed to install dependencies:", error);
      throw error;
    }
  }

  async addScripts(scripts: Record<string, string>): Promise<void> {
    // This will be handled by the individual integration commands
    // as they need to read and modify package.json directly
  }

  async addDependencies(
    dependencies: Record<string, string>,
    isDev: boolean = false
  ): Promise<void> {
    const packages = Object.entries(dependencies).map(
      ([name, version]) => `${name}@${version}`
    );
    await this.install(packages, isDev);
  }
}

class YarnPackageManager implements PackageManager {
  async install(packages: string[], isDev: boolean = false): Promise<void> {
    if (packages.length === 0) return;

    const flag = isDev ? "--dev" : "";
    const command = `yarn add ${flag} ${packages.join(" ")}`;

    try {
      console.log(`📦 Running: ${command}`);
      execSync(command, { stdio: "inherit" });
      console.log("✅ Dependencies installed successfully");
    } catch (error) {
      console.error("❌ Failed to install dependencies:", error);
      throw error;
    }
  }

  async addScripts(scripts: Record<string, string>): Promise<void> {
    // This will be handled by the individual integration commands
  }

  async addDependencies(
    dependencies: Record<string, string>,
    isDev: boolean = false
  ): Promise<void> {
    const packages = Object.entries(dependencies).map(
      ([name, version]) => `${name}@${version}`
    );
    await this.install(packages, isDev);
  }
}

class PnpmPackageManager implements PackageManager {
  async install(packages: string[], isDev: boolean = false): Promise<void> {
    if (packages.length === 0) return;

    const flag = isDev ? "--save-dev" : "--save";
    const command = `pnpm add ${flag} ${packages.join(" ")}`;

    try {
      console.log(`📦 Running: ${command}`);
      execSync(command, { stdio: "inherit" });
      console.log("✅ Dependencies installed successfully");
    } catch (error) {
      console.error("❌ Failed to install dependencies:", error);
      throw error;
    }
  }

  async addScripts(scripts: Record<string, string>): Promise<void> {
    // This will be handled by the individual integration commands
  }

  async addDependencies(
    dependencies: Record<string, string>,
    isDev: boolean = false
  ): Promise<void> {
    const packages = Object.entries(dependencies).map(
      ([name, version]) => `${name}@${version}`
    );
    await this.install(packages, isDev);
  }
}

/**
 * Detects the package manager being used in the project
 */
export function detectPackageManager(): PackageManager {
  if (existsSync("pnpm-lock.yaml")) {
    return new PnpmPackageManager();
  } else if (existsSync("yarn.lock")) {
    return new YarnPackageManager();
  } else {
    return new NpmPackageManager();
  }
}

/**
 * Installs npm packages using the detected package manager
 * @param packages Array of package names to install
 * @param isDev Whether to install as dev dependencies
 */
export async function installPackages(
  packages: string[],
  isDev: boolean = false
): Promise<void> {
  const pm = detectPackageManager();
  await pm.install(packages, isDev);
}

/**
 * Adds dependencies with specific versions using the detected package manager
 * @param dependencies Object with package names as keys and versions as values
 * @param isDev Whether to install as dev dependencies
 */
export async function addDependencies(
  dependencies: Record<string, string>,
  isDev: boolean = false
): Promise<void> {
  const pm = detectPackageManager();
  await pm.addDependencies(dependencies, isDev);
}

/**
 * Checks if a package is installed
 * @param packageName Name of the package to check
 */
export function isPackageInstalled(packageName: string): boolean {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the version of an installed package
 * @param packageName Name of the package
 */
export function getPackageVersion(packageName: string): string | null {
  try {
    const packageJson = require(`${packageName}/package.json`);
    return packageJson.version;
  } catch {
    return null;
  }
}
