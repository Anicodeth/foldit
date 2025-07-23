// src/templates/nextAuthRouteTemplate.ts

export function generateNextAuthRouteTemplate(): string {
  return `import { authOptions } from "@/lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
`;
}
