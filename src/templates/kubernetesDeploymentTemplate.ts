interface KubernetesDeploymentOptions {
  namespace: string;
  replicas: number;
  port: number;
  imageName: string;
  imageTag: string;
}

export function generateKubernetesDeploymentTemplate(
  options: KubernetesDeploymentOptions
): string {
  const { namespace, replicas, port, imageName, imageTag } = options;

  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
  namespace: ${namespace}
  labels:
    app: nextjs-app
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      containers:
      - name: nextjs-app
        image: ${imageName}:${imageTag}
        ports:
        - containerPort: ${port}
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "${port}"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL
      securityContext:
        fsGroup: 1001
      imagePullSecrets:
      - name: regcred`;
}
