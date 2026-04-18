import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth';

export const BASE_URL = '/api/v1';

export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { headers, requireAuth = true, ...customConfig } = options;

  let requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(requireAuth ? getAuthHeaders() : {}),
    ...headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers: requestHeaders,
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401 && requireAuth) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token?refresh_token=${encodeURIComponent(refreshToken)}`, {
          method: 'POST',
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          saveTokens(data.access_token, data.refresh_token);
          
          requestHeaders = {
            ...requestHeaders,
            ...getAuthHeaders(),
          };
          
          config.headers = requestHeaders;
          response = await fetch(`${BASE_URL}${endpoint}`, config);
        } else {
          clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      } catch (err) {
        clearTokens();
        window.location.href = '/login';
        throw err;
      }
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Not authenticated');
    }
  }

  let data;
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (isJson) {
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
  }

  if (!response.ok) {
    let errorMessage = 'Something went wrong, try again';
    
    if (response.status === 403) {
      errorMessage = "You don't have permission";
    } else if (response.status === 404) {
      errorMessage = "Not found";
    } else if (response.status === 422) {
       if (data?.detail && Array.isArray(data.detail)) {
         errorMessage = data.detail.map((err: any) => err.msg).join(', ');
       } else if (data?.detail) {
         errorMessage = data.detail;
       } else {
         errorMessage = "Validation error";
       }
    } else if (response.status === 500) {
      errorMessage = "Something went wrong, try again";
    } else {
      errorMessage = data?.detail || data?.message || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  return data as T;
}
