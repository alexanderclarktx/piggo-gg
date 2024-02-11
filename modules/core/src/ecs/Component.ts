
// 个 gè (single)
// a Component is an atomic unit of data that is attached to an entity
export class Component<T extends string> {
  type: T;

  networked: boolean = false;

  data: Record<string, string | number> = {};

  // copies the networked data
  serialize: () => Record<string, string | number> = () => {
    let data: Record<string, string | number> = {};
    Object.keys(this.data).forEach((key) => data[key] = this.data[key]);

    return data;
  }

  deserialize: (data: Record<string, string | number>) => void = (data) => {
    this.data = data;
  }
}
