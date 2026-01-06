import { ApiResponse } from '@workspace/shared-types';
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const defaultOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // important: send cookies
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  let response: Response;
  let data: ApiResponse;
  try {
    //console.log(`API Request to ${endpoint} with options:`, defaultOptions, baseUrl);
    response = await fetch(`${baseUrl}${endpoint}`, defaultOptions);
    if (!response.ok) {
      let message = response.statusText || 'Request failed';
      // Try to get error message from response body if available
      try {
        const errorBody = await response.json();
        if (errorBody && typeof errorBody.message === 'string') {
          message = errorBody.message;
        }
      } catch {}
      // If message contains 'Cannot', replace with user-friendly message
      if (message && message.toLowerCase().includes('cannot')) {
        message = 'Network error: Please try again.';
      }
      data = {
        status: response.status,
        message,
        data: null,
      };
    } else {
      data = await response.json();
    }
  } catch {
    data = {
      status: 400,
      message: 'Network error: Failed to fetch',
      data: null,
    };
  }

  //console.log(`API Request to ${endpoint} responded with:`, data);

  // If access token expired (401)
  if (data.status === 401 && data.message !== 'Refresh token not found') {
    //console.log('🔄 Access token expired, refreshing token...');

    try {
      // Call refresh endpoint
      const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok) {
        if (refreshResponse.status === 401) {
          return {
            message: 'Session expired. Please login again.',
            status: 400,
            data: null,
          };
        } else {
          return {
            message: refreshData?.message || 'Failed to refresh token',
            status: 400,
            data: null,
          };
        }
      }

      // Retry original request after refreshing token
      response = await fetch(`${baseUrl}${endpoint}`, defaultOptions);

      // Parse the retry response
      const retryData = await response.json();

      if (!response.ok) {
        // Handle error from retried request (not 401)
        return {
          message: retryData?.message || 'Request failed ',
          status: 400,
          data: null,
        };
      }

      // Success after refresh
      return retryData;
    } catch {
      return {
        message: 'Network error :Please try again later.',
        status: 500,
        data: null,
      };
    }
  }
  return data;
}
