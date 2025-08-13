/// <reference types="vite/client" />

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        colorScheme?: "light" | "dark";
        onEvent?: (event: string, callback: () => void) => void;
        offEvent?: (event: string, callback: () => void) => void;
        initData?: string;
        initDataUnsafe?: Record<string, unknown>;
        version?: string;
        platform?: string;
        themeParams?: Record<string, unknown>;
      };
    };
  }
}

export {};
