import { Entity, System, SystemProps } from "@piggo-legends/core";

export class DamageSystem extends System<SystemProps> {
  onTick = (entities: Entity<any>[]) => {
    // console.log("DamageSystem.onTick", entities);
  }
}
