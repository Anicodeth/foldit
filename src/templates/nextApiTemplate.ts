export function generateApiRouteTemplate(
  apiName: string,
  methods: string[],
  options: {
    auth?: boolean;
    prisma?: boolean;
    dynamic?: string;
    catchAll?: boolean;
  }
): string {
  const capitalizedName = apiName.charAt(0).toUpperCase() + apiName.slice(1);
  const dynamicParam = options.dynamic;
  const isCatchAll = options.catchAll;

  let imports = "import { NextRequest, NextResponse } from 'next/server';\n";

  if (options.auth) {
    imports += "import { authMiddleware } from '@/lib/auth';\n";
  }

  if (options.prisma) {
    imports += "import prisma from '@/lib/prisma';\n";
  }

  let handlers = "";

  for (const method of methods) {
    const upperMethod = method.toUpperCase();
    const lowerMethod = method.toLowerCase();

    handlers += `
export async function ${lowerMethod}(request: NextRequest) {
  try {
    ${
      options.auth
        ? `// Apply authentication middleware
    const authResult = await authMiddleware(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }`
        : ""
    }
    
    ${
      dynamicParam
        ? `// Get dynamic parameter
    const ${dynamicParam} = request.nextUrl.pathname.split('/').pop();`
        : ""
    }
    
    ${
      options.prisma
        ? `// Example database operation
    // const ${apiName} = await prisma.${apiName}.findMany();`
        : ""
    }
    
    // TODO: Implement ${upperMethod} logic for ${apiName}
    return NextResponse.json({ 
      message: '${upperMethod} ${capitalizedName} API endpoint',
      ${dynamicParam ? `${dynamicParam},` : ""}
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in ${lowerMethod} ${apiName}:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}`;
  }

  return `${imports}
${handlers}
`;
}
