import { Entity } from "./Entity";

// a System is a stateless function that is applied to all entities that have a certain set of components
export abstract class System {
  abstract name: string;
  abstract onTick: (entities: Entity[]) => void;
}
