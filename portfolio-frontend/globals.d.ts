// frontend/globals.d.ts

export {};

declare global {
  interface Window {
    electronAPI?: {
      getAuthToken: () => Promise<string>;
      logout: () => Promise<void>;
      openBrowserLogin: () => Promise<void>;
      minimizeToTray: () => Promise<void>;
      reload: () => Promise<void>;
      quitApp: () => Promise<void>;
      onLogoutRequested: (callback: () => void) => void;
      loginWithBrowser: () => Promise<void>;
      getToken: () => Promise<string | null>;
      getUser: () => Promise<any | null>;
      getDeviceId: () => Promise<string>;
      verify2FA: (otp: string) => Promise<{ success: boolean; message?: string }>;
      onDeepLink: (callback: (data: any) => void) => void;
    };
  }
}
