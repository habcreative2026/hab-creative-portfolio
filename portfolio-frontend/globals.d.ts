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
      // ⭐ THÊM CÁC METHOD MỚI
      loginWithBrowser: () => Promise<void>;
      getToken: () => Promise<string | null>;
      getUser: () => Promise<any | null>;
      getDeviceId: () => Promise<string>;
      onDeepLink: (callback: (data: any) => void) => void;
    };
  }
}
