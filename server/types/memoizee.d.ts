declare module 'memoizee' {
  function memoize<T extends (...args: any[]) => any>(
    fn: T,
    options?: {
      length?: number;
      maxAge?: number;
      max?: number;
      preFetch?: boolean | number;
      primitive?: boolean;
      promise?: boolean;
      normalizer?: (args: any[]) => string;
      resolvers?: Array<(arg: any) => any>;
      dispose?: (value: any) => void;
    }
  ): T;

  export = memoize;
}