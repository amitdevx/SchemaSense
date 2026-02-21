/**
 * API Client Utility
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api`;

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  includeAuth?: boolean;
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Generic fetch wrapper with auth & error handling
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    includeAuth = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if available
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const requestConfig: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (body) {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestConfig);

    // Handle 401 - redirect to login
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        window.location.href = '/sign-in';
      }
      throw new ApiError(401, 'Unauthorized - please sign in again');
    }

    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || 'An error occurred';
      throw new ApiError(response.status, errorMessage, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

/**
 * Convenience methods for common endpoints
 */
export const api = {
  // Database Connection
  connectDatabase: (credentials: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    schema_filter?: string;
    name?: string;
    database_type?: string;
  }) =>
    apiCall('/connect-db', {
      method: 'POST',
      body: credentials,
      includeAuth: false,
    }),

  disconnectDatabase: () =>
    apiCall('/disconnect-db', {
      method: 'POST',
    }),

  // Multi-connection management
  getConnections: () => apiCall('/connections'),
  activateConnection: (connectionId: string) =>
    apiCall(`/connections/${connectionId}/activate`, { method: 'POST' }),
  removeConnection: (connectionId: string) =>
    apiCall(`/connections/${connectionId}`, { method: 'DELETE' }),

  // Tables (with optional connection_id)
  getTables: (connectionId?: string) =>
    apiCall(`/tables${connectionId ? `?connection_id=${connectionId}` : ''}`),
  getSchema: (tableName: string, connectionId?: string) =>
    apiCall(`/schema/${tableName}${connectionId ? `?connection_id=${connectionId}` : ''}`),
  getQuality: (tableName: string, connectionId?: string) =>
    apiCall(`/quality/${tableName}${connectionId ? `?connection_id=${connectionId}` : ''}`),
  getSampleData: (tableName: string, limit: number = 5, connectionId?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (connectionId) params.set('connection_id', connectionId);
    return apiCall(`/samples/${tableName}?${params.toString()}`);
  },
  explainTable: (tableName: string, connectionId?: string) =>
    apiCall(`/explain/${tableName}${connectionId ? `?connection_id=${connectionId}` : ''}`),
  exportTable: (tableName: string, connectionId?: string) =>
    apiCall(`/export/${tableName}${connectionId ? `?connection_id=${connectionId}` : ''}`),

  // Chat
  chat: (question: string, connectionId?: string) =>
    apiCall('/chat', {
      method: 'POST',
      body: { question, connection_id: connectionId || undefined },
    }),

  // Auth
  register: (name: string, email: string, password: string) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: { name, email, password },
      includeAuth: false,
    }),

  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: { email, password },
      includeAuth: false,
    }),

  getProfile: () => apiCall('/auth/profile'),

  // Dashboard
  getDatabases: () => apiCall('/databases'),
  getStatistics: () => apiCall('/statistics'),
  getSyncStatus: () => apiCall('/sync-status'),
  getConnectionStatus: () => apiCall('/connection-status'),
  logout: () => apiCall('/logout', { method: 'POST' }),

  // Profile
  getProfile: () => apiCall('/profile', { method: 'GET' }),
  updateProfile: (data: any) => apiCall('/profile', { method: 'PUT', body: data }),

  // Settings
  getSettings: () => apiCall('/settings', { method: 'GET' }),
  updateSettings: (data: any) => apiCall('/settings', { method: 'PUT', body: data }),

  // Integrations
  listIntegrations: () => apiCall('/integrations', { method: 'GET' }),
  createIntegration: (data: any) => apiCall('/integrations', { method: 'POST', body: data }),
  updateIntegration: (id: string, data: any) => apiCall(`/integrations/${id}`, { method: 'PUT', body: data }),
  deleteIntegration: (id: string) => apiCall(`/integrations/${id}`, { method: 'DELETE' }),
  testIntegration: (id: string) => apiCall(`/integrations/${id}/test`, { method: 'POST' }),

  healthCheck: () => apiCall('/health', { includeAuth: false }),

  // Activity
  getRecentActivity: (limit: number = 20) => apiCall(`/activity/recent?limit=${limit}`),
};
