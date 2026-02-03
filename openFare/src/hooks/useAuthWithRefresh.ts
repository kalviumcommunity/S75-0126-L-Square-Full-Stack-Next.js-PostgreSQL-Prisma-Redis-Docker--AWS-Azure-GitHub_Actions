import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const useAuthWithRefresh = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  const router = useRouter();

  // Load initial auth state from localStorage/sessionStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          accessToken: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        clearAuth();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Store auth data
  const setAuth = useCallback((user: User, accessToken: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    
    setAuthState({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  // Clear auth data
  const clearAuth = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    
    setAuthState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies for refresh token
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      if (data.success && data.accessToken) {
        // Update access token in storage
        localStorage.setItem('accessToken', data.accessToken);
        setAuthState(prev => ({
          ...prev,
          accessToken: data.accessToken,
        }));
        return data.accessToken;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  // Make authenticated request with auto-refresh
  const fetchWithAuth = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const makeRequest = async (token: string | null) => {
      const headers = new Headers(options.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If token expired, try to refresh and retry
      if (response.status === 401 || response.status === 403) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with new token
          const retryHeaders = new Headers(options.headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          
          return fetch(url, {
            ...options,
            headers: retryHeaders,
          });
        }
      }

      return response;
    };

    return makeRequest(authState.accessToken);
  }, [authState.accessToken, refreshAccessToken]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies for refresh token
      });

      const data = await response.json();

      if (data.success) {
        setAuth(data.user, data.accessToken);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  }, [setAuth]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API to revoke refresh token
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  return {
    ...authState,
    login,
    logout,
    fetchWithAuth,
    refreshAccessToken,
    setAuth,
    clearAuth,
  };
};

export default useAuthWithRefresh;