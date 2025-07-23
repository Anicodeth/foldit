interface KubernetesServiceOptions {
  namespace: string;
  port: number;
  serviceType: "ClusterIP" | "NodePort" | "LoadBalancer";
}

export function generateKubernetesServiceTemplate(
  options: KubernetesServiceOptions
): string {
  const { namespace, port, serviceType } = options;

  return `apiVersion: v1
kind: Service
metadata:
  name: nextjs-service
  namespace: ${namespace}
  labels:
    app: nextjs-app
spec:
  type: ${serviceType}
  ports:
  - port: ${port}
    targetPort: ${port}
    protocol: TCP
    name: http
  selector:
    app: nextjs-app
  sessionAffinity: None`;
}
