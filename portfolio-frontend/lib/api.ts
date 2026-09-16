// frontend/app/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMe() {
  try {
    const response = await fetch(`${API_URL}/api/admin/me`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return null; // 401 → coi như chưa login
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
