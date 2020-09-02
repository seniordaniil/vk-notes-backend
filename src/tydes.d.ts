declare type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

declare type ResolverInterface<T> = {
  [P in keyof T]?: (root: T, ...args: any[]) => T[P] | Promise<T[P]>;
};
