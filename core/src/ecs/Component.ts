
// 个 gè (one of)
// a Component is an atomic unit of data that is attached to an entity
export abstract class Component<T extends string> {
  abstract type: T;

  data: Record<string, string | number> = {};

  // serializes data from component
  serialize: () => Record<string, string | number> = () => {
    let data: Record<string, string | number> = {};
    Object.keys(this.data).forEach((key) => data[key] = this.data[key]);

    return data;
  }

  // copies networked data to the component
  deserialize: (data: Record<string, string | number>) => void = (data) => {
    for (const [key, value] of Object.entries(data)) {
      this.data[key] = value;
    }
  }
}
