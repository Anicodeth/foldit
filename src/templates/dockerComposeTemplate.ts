interface DockerComposeOptions {
  port: number;
  production: boolean;
}

export function generateDockerComposeTemplate(
  options: DockerComposeOptions
): string {
  const { port, production } = options;

  if (production) {
    return `version: '3.8'

services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
      - PORT=${port}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${port}/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`;
  } else {
    return `version: '3.8'

services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=development
      - PORT=${port}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${port}/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`;
  }
}
