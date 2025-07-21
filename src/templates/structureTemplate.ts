export interface StructureConfig {
  directories: string[];
  description: string;
}

export const BASIC_STRUCTURE: StructureConfig = {
  directories: [
    "src/app",
    "src/app/api",
    "src/components",
    "src/lib",
    "src/types",
    "src/styles",
  ],
  description: `Basic structure includes:
   ├── app/                    # Entry point for routing
   │   ├── api/                # Serverless API routes
   ├── components/             # Reusable UI components
   ├── lib/                    # Utility functions and DB clients
   ├── types/                  # Global TS types/interfaces
   └── styles/                 # Global and modular CSS`,
};

export const MEDIUM_STRUCTURE: StructureConfig = {
  directories: [
    "src/app",
    "src/app/api",
    "src/components",
    "src/hooks",
    "src/lib",
    "src/services",
    "src/types",
    "src/styles",
  ],
  description: `Medium structure includes:
   ├── app/                    # Entry point for routing
   │   ├── api/                # Serverless API routes
   ├── components/             # Reusable UI components
   ├── hooks/                  # Custom React hooks
   ├── lib/                    # Utility functions and DB clients
   ├── services/               # Service layer (API abstractions)
   ├── types/                  # Global TS types/interfaces
   └── styles/                 # Global and modular CSS`,
};

export function getStructureConfig(type: "basic" | "medium"): StructureConfig {
  switch (type) {
    case "basic":
      return BASIC_STRUCTURE;
    case "medium":
      return MEDIUM_STRUCTURE;
    default:
      throw new Error(`Unknown structure type: ${type}`);
  }
}
