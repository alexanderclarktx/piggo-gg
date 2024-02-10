
// 个 gè (single)
// a Component is an atomic unit of data that is attached to an entity
export interface Component<T extends string> {
  type: T;
  serialize?: () => unknown;
  deserialize?: (data: unknown) => void;
}
