// frontend/app/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ⭐ Lấy token từ electronAPI (nếu có)
async function getAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined" && window.electronAPI) {
    try {
      return await window.electronAPI.getToken();
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }
  return null;
}

// ⭐ Tạo headers với token (nếu có)
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// ⭐ Fetch wrapper - tự động thêm token
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}

// ⭐ Refresh token
export async function refreshToken() {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return data.success;
    }
    return false;
  } catch (error) {
    console.error("Refresh token error:", error);
    return false;
  }
}

// ⭐ Get current user
export async function getMe() {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/admin/me`, {
      cache: "no-store",
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const retryResponse = await fetchWithAuth(`${API_URL}/api/admin/me`, {
          cache: "no-store",
        });
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("getMe error:", error);
    return null;
  }
}

// ⭐ Logout
export async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
}
