interface KubernetesConfigMapOptions {
  namespace: string;
}

export function generateKubernetesConfigMapTemplate(
  options: KubernetesConfigMapOptions
): string {
  const { namespace } = options;

  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: nextjs-config
  namespace: ${namespace}
data:
  NODE_ENV: "production"
  NEXT_PUBLIC_API_URL: "https://api.your-domain.com"
  NEXT_PUBLIC_APP_URL: "https://your-domain.com"
  # Add your custom environment variables here
  # DATABASE_URL: "your-database-url"
  # REDIS_URL: "your-redis-url"
  # JWT_SECRET: "your-jwt-secret"`;
}
