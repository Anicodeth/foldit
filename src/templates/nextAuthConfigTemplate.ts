// src/templates/nextAuthConfigTemplate.ts

interface NextAuthConfigOptions {
  provider?: string;
  prisma?: boolean;
  session?: "jwt" | "database";
  env?: boolean;
  route?: boolean;
}

export function generateNextAuthConfigTemplate(
  options: NextAuthConfigOptions
): string {
  const sessionStrategy = options.session || "jwt";
  const usePrisma = options.prisma;
  const provider = options.provider?.toLowerCase();

  let config = `import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"`;

  if (usePrisma) {
    config += `
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"`;
  }

  // Add provider imports
  if (provider) {
    switch (provider) {
      case "github":
        config += `
import GitHubProvider from "next-auth/providers/github"`;
        break;
      case "google":
        config += `
import GoogleProvider from "next-auth/providers/google"`;
        break;
      case "discord":
        config += `
import DiscordProvider from "next-auth/providers/discord"`;
        break;
      case "credentials":
        config += `
import CredentialsProvider from "next-auth/providers/credentials"`;
        break;
    }
  }

  config += `

export const authOptions: NextAuthOptions = {
  adapter: ${usePrisma ? "PrismaAdapter(prisma)" : "undefined"},
  session: {
    strategy: "${sessionStrategy}",
  },
  providers: [`;

  // Add providers
  if (provider) {
    switch (provider) {
      case "github":
        config += `
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),`;
        break;
      case "google":
        config += `
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),`;
        break;
      case "discord":
        config += `
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),`;
        break;
      case "credentials":
        config += `
    CredentialsProvider({
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
}

export default NextAuth(authOptions)
`;

  return config;
}
