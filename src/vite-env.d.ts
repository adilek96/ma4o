/// <reference types="vite/client" />

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: string;
        themeParams: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
        };
      };
      // Старые свойства для обратной совместимости
      colorScheme?: "light" | "dark";
      onEvent?: (event: string, callback: () => void) => void;
      offEvent?: (event: string, callback: () => void) => void;
      initData?: string;
      initDataUnsafe?: Record<string, unknown>;
      version?: string;
      platform?: string;
      themeParams?: Record<string, unknown>;
    };
  }
}

export {};
