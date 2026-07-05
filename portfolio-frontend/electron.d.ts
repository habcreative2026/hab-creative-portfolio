// frontend/types/electron.d.ts

export {};

declare global {
  interface Window {
    electronAPI?: {
      getDeviceId: () => Promise<string>;
      getAuthToken: () => Promise<string>;
      getLicenseInfo: () => Promise<{
        licenseKey: string | null;
        expiresAt: string | null;
        isAuthenticated: boolean;
      }>;
      logout: () => Promise<void>;
      openBrowserLogin: () => Promise<void>;
      minimizeToTray: () => Promise<void>;
      reload: () => Promise<void>;
      quitApp: () => Promise<void>;
      activateLicense: (key: string) => void;
      onLicenseActivated: (callback: (data: any) => void) => void;
      onActivationError: (callback: (data: any) => void) => void;
    };
  }
}
