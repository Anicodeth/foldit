interface AxiosConfigOptions {
  withInterceptors?: boolean;
  withErrorHandling?: boolean;
  withAuth?: boolean;
  withRetry?: boolean;
}

export function generateAxiosConfigTemplate(
  options: AxiosConfigOptions
): string {
  let config = `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});`;

  if (options.withInterceptors) {
    config += `

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      console.log(\`API Request: \${response.config.url} - \${duration}ms\`);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or refresh token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.error('Access denied');
    }
    
    if (error.response?.status >= 500) {
      // Server error - show generic error message
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);`;
  }

  if (options.withRetry) {
    config += `

// Retry interceptor for failed requests
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Only retry on network errors or 5xx server errors
    if (!config || !config.retry || error.response?.status < 500) {
      return Promise.reject(error);
    }
    
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount >= config.retry) {
      return Promise.reject(error);
    }
    
    config.retryCount += 1;
    
    // Exponential backoff
    const delay = config.retryDelay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, config.retryCount - 1)));
    
    return apiClient(config);
  }
);`;
  }

  config += `

// Helper function to add retry configuration
export const withRetry = (config: AxiosRequestConfig, retries: number = 3, delay: number = 1000) => {
  return {
    ...config,
    retry: retries,
    retryDelay: delay,
  };
};

// Helper function to add auth token
export const withAuth = (config: AxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: \`Bearer \${token}\`,
      };
    }
  }
  return config;
};

// Export the configured client
export { apiClient };`;

  return config;
}
