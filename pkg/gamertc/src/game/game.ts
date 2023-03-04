import { Entity } from "../ecs/entity";
import { System } from "../ecs/system";

export abstract class Game {
  entities: Entity[] = [];
  systems: System[] = [];

  constructor(entities: Entity[] = [], systems: System[] = []) {
    this.entities = entities;
    this.systems = systems;
  }

  onTick = () => {
    console.log("tick");
    this.systems.forEach((system) => {
      system.onTick(this.entities);
    });
  }
  abstract render: () => void;
}

class MyGame extends Game {
  render = () => {
    console.log("render");
  }
}
