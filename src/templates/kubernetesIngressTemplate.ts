interface KubernetesIngressOptions {
  namespace: string;
  port: number;
}

export function generateKubernetesIngressTemplate(
  options: KubernetesIngressOptions
): string {
  const { namespace, port } = options;

  return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nextjs-ingress
  namespace: ${namespace}
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: nextjs-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nextjs-service
            port:
              number: ${port}
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: nextjs-service
            port:
              number: ${port}`;
}
