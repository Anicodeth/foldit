// src/commands/addKube.ts
import * as path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { generateKubernetesDeploymentTemplate } from "../templates/kubernetesDeploymentTemplate";
import { generateKubernetesServiceTemplate } from "../templates/kubernetesServiceTemplate";
import { generateKubernetesIngressTemplate } from "../templates/kubernetesIngressTemplate";
import { generateKubernetesConfigMapTemplate } from "../templates/kubernetesConfigMapTemplate";

interface AddKubeOptions {
  namespace?: string;
  replicas?: number;
  port?: number;
  withIngress?: boolean;
  withConfigMap?: boolean;
  imageName?: string;
  imageTag?: string;
  serviceType?: "ClusterIP" | "NodePort" | "LoadBalancer";
}

/**
 * Adds Kubernetes configuration files to a Next.js project.
 * @param options Configuration options for Kubernetes setup
 */
export async function addKube(options: AddKubeOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const namespace = options.namespace || "default";
  const replicas = options.replicas || 2;
  const port = options.port || 3000;
  const imageName = options.imageName || "nextjs-app";
  const imageTag = options.imageTag || "latest";
  const serviceType = options.serviceType || "ClusterIP";

  console.log("☸️  Adding Kubernetes configuration...");

  // Check if package.json exists
  const packageJsonPath = path.join(cwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    console.error(
      "❌ package.json not found. Please run this command in a Node.js project directory."
    );
    process.exit(1);
  }

  // Create k8s directory
  const k8sDir = path.join(cwd, "k8s");
  await fs.mkdir(k8sDir, { recursive: true });

  try {
    // Generate deployment.yaml
    const deploymentContent = generateKubernetesDeploymentTemplate({
      namespace,
      replicas,
      port,
      imageName,
      imageTag,
    });
    await fs.writeFile(
      path.join(k8sDir, "deployment.yaml"),
      deploymentContent,
      { flag: "wx" }
    );
    console.log("✅ Created k8s/deployment.yaml");

    // Generate service.yaml
    const serviceContent = generateKubernetesServiceTemplate({
      namespace,
      port,
      serviceType,
    });
    await fs.writeFile(path.join(k8sDir, "service.yaml"), serviceContent, {
      flag: "wx",
    });
    console.log("✅ Created k8s/service.yaml");

    // Generate ingress.yaml
    if (options.withIngress) {
      const ingressContent = generateKubernetesIngressTemplate({
        namespace,
        port,
      });
      await fs.writeFile(path.join(k8sDir, "ingress.yaml"), ingressContent, {
        flag: "wx",
      });
      console.log("✅ Created k8s/ingress.yaml");
    }

    // Generate configmap.yaml
    if (options.withConfigMap) {
      const configMapContent = generateKubernetesConfigMapTemplate({
        namespace,
      });
      await fs.writeFile(
        path.join(k8sDir, "configmap.yaml"),
        configMapContent,
        { flag: "wx" }
      );
      console.log("✅ Created k8s/configmap.yaml");
    }

    console.log("\n🎉 Kubernetes configuration complete!");
    console.log("\n📋 Next steps:");
    console.log("   • Apply deployment: kubectl apply -f k8s/deployment.yaml");
    console.log("   • Apply service: kubectl apply -f k8s/service.yaml");

    if (options.withIngress) {
      console.log("   • Apply ingress: kubectl apply -f k8s/ingress.yaml");
    }

    if (options.withConfigMap) {
      console.log("   • Apply configmap: kubectl apply -f k8s/configmap.yaml");
    }

    console.log("   • Check status: kubectl get pods -n", namespace);
  } catch (error: any) {
    if (error.code === "EEXIST") {
      console.error(
        "❌ Kubernetes files already exist. Use --force to overwrite."
      );
    } else {
      console.error("❌ Error creating Kubernetes files:", error.message);
    }
    process.exit(1);
  }
}
