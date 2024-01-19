
// 个 gè (single) - a Component is a set of data that is attached to an entity
export interface Component<T extends string> {
  type: T;
  serialize?: () => unknown;
  deserialize?: (data: unknown) => void;
}
