// Ecstacy is the manager class for entities and systems
export class Ecstacy {
  entities: Entity[] = [];
  systems: System[] = [];

  constructor(entities: Entity[], systems: System[]) {
    this.entities = entities;
    this.systems = systems;
  }

  onTick(): void {
    this.systems.forEach((system) => {
      system.onTick(this.entities);
    });
  }
}

// Entity Component System (ECS) is a pattern for organizing game objects
// where each object is a collection of components (an entity), and each
// component is a set of data. Systems are functions that are applied to
// all entities that have a certain set of components.

// an Entity is a collection of components
export abstract class Entity {
  components: Component[] = [];
  name: string;
}

// a Component is a set of data that is attached to an entity
export abstract class Component {
  // entity: Entity = null;
}

// a System is a function that is applied to all entities that have a certain set of components
export abstract class System {
  abstract name: string;
  abstract onTick: (entities: Entity[]) => void;
}
