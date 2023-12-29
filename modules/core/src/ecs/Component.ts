
// 个 gè (single) - a Component is a set of data that is attached to an entity
export interface Component<T> {
  type: T;
  serialize?: () => any;
}
