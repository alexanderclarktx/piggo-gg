import { Entity, System } from "../../shared/ecs";

export class DamageSystem extends System {
  name: string;
  onTick = (entities: Entity[]) => {
    console.log("DamageSystem.onTick", entities);
  }
}
