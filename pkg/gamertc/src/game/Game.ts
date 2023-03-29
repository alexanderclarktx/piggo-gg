import { Renderer } from "../graphics/Renderer";
import { Entity } from "../ecs/Entity";
import { System } from "../ecs/System";

export type GameProps = {
  renderer: Renderer;
  entities: Entity[];
  systems: System[];
}

export abstract class Game {
  renderer: Renderer;
  entities: Entity[] = [];
  systems: System[] = [];

  constructor({ renderer, entities, systems }: GameProps) {
    this.renderer = renderer;
    this.entities = entities;
    this.systems = systems;
  }

  onTick = () => {
    console.log("tick");
    this.systems.forEach((system) => {
      system.onTick(this.entities);
    });
  }
}
