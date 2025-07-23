// src/templates/betterAuthConfigTemplate.ts

interface BetterAuthConfigOptions {
  provider?: string;
  prisma?: boolean;
  session?: "jwt" | "database";
  env?: boolean;
  route?: boolean;
}

export function generateBetterAuthConfigTemplate(
  options: BetterAuthConfigOptions
): string {
  const sessionStrategy = options.session || "jwt";
  const usePrisma = options.prisma;
  const provider = options.provider?.toLowerCase();

  let config = `import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"`;

  if (usePrisma) {
    config += `
import { prisma } from "./prisma"`;
  }

  // Add provider imports
  if (provider) {
    switch (provider) {
      case "github":
        config += `
import GitHub from "next-auth/providers/github"`;
        break;
      case "google":
        config += `
import Google from "next-auth/providers/google"`;
        break;
      case "discord":
        config += `
import Discord from "next-auth/providers/discord"`;
        break;
      case "credentials":
        config += `
import Credentials from "next-auth/providers/credentials"`;
        break;
    }
  }

  config += `

export default {
  adapter: ${usePrisma ? "PrismaAdapter(prisma)" : "DrizzleAdapter(db)"},
  session: {
    strategy: "${sessionStrategy}",
  },
  providers: [`;

  // Add providers
  if (provider) {
    switch (provider) {
      case "github":
        config += `
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),`;
        break;
      case "google":
        config += `
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),`;
        break;
      case "discord":
        config += `
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),`;
        break;
      case "credentials":
        config += `
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // Example:
        // const user = await validateUser(credentials?.email, credentials?.password)
        // return user
        
        return null
      }
    }),`;
        break;
    }
  }

  config += `
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
} satisfies NextAuthConfig
`;

  return config;
}
