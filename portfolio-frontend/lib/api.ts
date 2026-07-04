// frontend/app/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ⭐ THÊM: Refresh token function
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

export async function getMe() {
  try {
    const response = await fetch(`${API_URL}/api/admin/me`, {
      credentials: "include",
      cache: "no-store",
    });

    // ⭐ Nếu 401, thử refresh token
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Thử lại lần nữa
        const retryResponse = await fetch(`${API_URL}/api/admin/me`, {
          credentials: "include",
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

export async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Clear local storage
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
}
