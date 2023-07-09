import { Entity, EntityProps, System, SystemProps } from "@piggo-legends/core";

export class DamageSystem extends System<SystemProps> {
  componentTypeQuery = ["health", "damage"];
  onTick = (entities: Entity<EntityProps>[]) => {
    // console.log("DamageSystem.onTick", entities);
  }
}
