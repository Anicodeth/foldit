interface ServiceTemplateOptions {
  baseUrl?: string;
  withTypes?: boolean;
  withInterceptors?: boolean;
  withErrorHandling?: boolean;
  withAuth?: boolean;
  withRetry?: boolean;
  withCache?: boolean;
}

export function generateServiceTemplate(
  serviceName: string,
  options: ServiceTemplateOptions
): string {
  const capitalizedName =
    serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  const baseUrl =
    options.baseUrl ||
    "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'";

  let imports = `import axios from 'axios';
import { apiClient } from './axiosConfig';`;

  if (options.withTypes) {
    imports += `
import { 
  ${capitalizedName}, 
  Create${capitalizedName}Request, 
  Update${capitalizedName}Request,
  ${capitalizedName}ListResponse,
  ${capitalizedName}Response,
  ApiError 
} from './${serviceName}Types';`;
  }

  const typeAnnotation = options.withTypes
    ? `${capitalizedName}ListResponse`
    : "any";
  const singleTypeAnnotation = options.withTypes
    ? `${capitalizedName}Response`
    : "any";
  const createTypeAnnotation = options.withTypes
    ? `Create${capitalizedName}Request`
    : "any";
  const updateTypeAnnotation = options.withTypes
    ? `Update${capitalizedName}Request`
    : "any";

  let serviceClass = `
export class ${capitalizedName}Service {
  private baseUrl = '${baseUrl}/${serviceName}';

  /**
   * Get all ${serviceName}s with pagination
   */
  async getAll(params?: { page?: number; limit?: number; search?: string }) {
    try {
      const response = await apiClient.get<${typeAnnotation}>(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single ${serviceName} by ID
   */
  async getById(id: string) {
    try {
      const response = await apiClient.get<${singleTypeAnnotation}>(\`\${this.baseUrl}/\${id}\`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new ${serviceName}
   */
  async create(data: ${createTypeAnnotation}) {
    try {
      const response = await apiClient.post<${singleTypeAnnotation}>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing ${serviceName}
   */
  async update(id: string, data: ${updateTypeAnnotation}) {
    try {
      const response = await apiClient.put<${singleTypeAnnotation}>(\`\${this.baseUrl}/\${id}\`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a ${serviceName}
   */
  async delete(id: string) {
    try {
      const response = await apiClient.delete<{ message: string }>(\`\${this.baseUrl}/\${id}\`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }`;

  if (options.withCache) {
    serviceClass += `

  /**
   * Get ${serviceName}s with caching
   */
  async getAllCached(params?: { page?: number; limit?: number; search?: string }) {
    const cacheKey = \`${serviceName}_list_\${JSON.stringify(params)}\`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await this.getAll(params);
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  }

  /**
   * Clear ${serviceName} cache
   */
  clearCache() {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('${serviceName}_')) {
        sessionStorage.removeItem(key);
      }
    });
  }`;
  }

  if (options.withRetry) {
    serviceClass += `

  /**
   * Retry wrapper for API calls
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }`;
  }

  serviceClass += `

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      const apiError = new Error(message) as any;
      apiError.status = error.response?.status;
      apiError.code = error.response?.data?.code;
      apiError.details = error.response?.data?.details;
      return apiError;
    }
    return error;
  }
}

// Export singleton instance
export const ${serviceName}Service = new ${capitalizedName}Service();`;

  return `${imports}${serviceClass}`;
}
