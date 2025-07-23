// src/templates/betterAuthRouteTemplate.ts

export function generateBetterAuthRouteTemplate(): string {
  return `import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
`;
}
