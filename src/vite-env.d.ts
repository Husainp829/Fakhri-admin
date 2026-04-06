/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

declare module "lodash.debounce" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T & { cancel(): void };
}
