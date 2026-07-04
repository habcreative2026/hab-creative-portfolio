// portfolio-frontend/app/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ⭐ Helper fetch với credentials luôn kèm
export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // ⭐ QUAN TRỌNG: Gửi cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Nếu 401, thử refresh token
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Thử lại lần nữa
        const retry = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        if (retry.ok) {
          return retry.json();
        }
      }
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ⭐ Refresh token
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // ⭐ QUAN TRỌNG
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ⭐ Get user info
export async function getMe() {
  try {
    const response = await fetch(`${API_URL}/api/admin/me`, {
      credentials: 'include', // ⭐ QUAN TRỌNG
      cache: 'no-store',
    });

    // Nếu 401, thử refresh token
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const retryResponse = await fetch(`${API_URL}/api/admin/me`, {
          credentials: 'include',
          cache: 'no-store',
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
      method: 'POST',
      credentials: 'include', // ⭐ QUAN TRỌNG
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
}
