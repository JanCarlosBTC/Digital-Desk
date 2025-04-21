/// <reference types="vite/client" />

// Properly defining the import.meta.env types that Vite uses
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot: {
    readonly data: any;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: string[], cb: (mods: any[]) => void): void;
    prune(cb: () => void): void;
    dispose(cb: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
}

interface ImportMetaEnv {
  [key: string]: string | boolean | undefined;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}