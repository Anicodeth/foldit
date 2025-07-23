// src/templates/nextAuthPrismaAdapterTemplate.ts

export function generateNextAuthPrismaAdapterTemplate(): string {
  return `import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const adapter = PrismaAdapter(prisma)

export default adapter
`;
}
