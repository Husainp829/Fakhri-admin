declare module "lodash/startCase" {
  function startCase(str?: string | null): string;
  export default startCase;
}

declare module "lodash.debounce" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: { leading?: boolean; maxWait?: number; trailing?: boolean }
  ): T & { cancel: () => void; flush: () => void };
  export default debounce;
}
