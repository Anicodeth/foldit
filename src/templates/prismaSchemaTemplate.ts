// src/templates/prismaSchemaTemplate.ts

export function generatePrismaSchemaTemplate(dbProvider: string): string {
  const providers = {
    sqlite: {
      provider: "sqlite",
      url: 'env("DATABASE_URL")',
      relationMode: "",
    },
    postgresql: {
      provider: "postgresql",
      url: 'env("DATABASE_URL")',
      relationMode: "",
    },
    mysql: {
      provider: "mysql",
      url: 'env("DATABASE_URL")',
      relationMode: "",
    },
    sqlserver: {
      provider: "sqlserver",
      url: 'env("DATABASE_URL")',
      relationMode: "",
    },
    mongodb: {
      provider: "mongodb",
      url: 'env("DATABASE_URL")',
      relationMode: "prisma",
    },
  };

  const config =
    providers[dbProvider as keyof typeof providers] || providers.sqlite;

  return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${config.provider}"
  url      = ${config.url}${
    config.relationMode ? `\n  relationMode = "${config.relationMode}"` : ""
  }
}

// Example model - remove or modify as needed
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// Add your models here
`;
}
