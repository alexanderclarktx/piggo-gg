import { Entity, System } from "@piggo-legends/gamertc";

export class DamageSystem extends System {
  override onTick = (entities: Entity<any>[]) => {
    console.log("DamageSystem.onTick", entities);
  }
}
