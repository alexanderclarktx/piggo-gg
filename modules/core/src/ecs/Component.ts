
// 个 gè (one of)
// a Component is an atomic unit of data that is attached to an entity
export abstract class Component<T extends string> {
  abstract type: T;

  networked: boolean = false;

  data: Record<string, string | number> = {};

  // copies the networked data
  serialize: () => Record<string, string | number> = () => {
    let data: Record<string, string | number> = {};
    Object.keys(this.data).forEach((key) => data[key] = this.data[key]);

    return data;
  }

  deserialize: (data: Record<string, string | number>) => void = (data) => {
    // console.log(`${JSON.stringify(this.data)}`);
    for (const [key, value] of Object.entries(data)) {
      this.data[key] = value;
    }
    // console.log(`${JSON.stringify(this.data)}`);
  }
}
