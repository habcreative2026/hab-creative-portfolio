// portfolio-frontend/types/electron.d.ts

export {};

declare global {
  interface Window {
    electronAPI?: {
      openBrowserLogin: () => Promise<void>;
      getDeviceId: () => Promise<string>;
      getAuthToken: () => Promise<string>;
      logout: () => Promise<void>;
      minimizeToTray: () => Promise<void>;
      reload: () => Promise<void>;
    };
  }
}
