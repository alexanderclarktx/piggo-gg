import { Entity } from "./Entity";

// a System is a stateless function that is applied to all entities that have a certain set of components
export class System {
  name: string;
  onTick: (entities: Entity<any>[]) => void;

  constructor({ name, onTick }: { name: string; onTick: (entities: Entity<any>[]) => void; }) {
    this.name = name;
    this.onTick = onTick;
  }
}
