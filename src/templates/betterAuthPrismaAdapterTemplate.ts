// src/templates/betterAuthPrismaAdapterTemplate.ts

export function generateBetterAuthPrismaAdapterTemplate(): string {
  return `import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const adapter = PrismaAdapter(prisma)

export default adapter
`;
}
