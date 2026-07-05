interface Window {
  electronAPI?: {
    getAuthToken: () => Promise<string>;
    logout: () => Promise<void>;
    openBrowserLogin: () => Promise<void>;
    minimizeToTray: () => Promise<void>;
    reload: () => Promise<void>;
    quitApp: () => Promise<void>;
    onLogoutRequested: (callback: () => void) => void;
  };
}
