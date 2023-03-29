import { Entity, System } from "@piggo-legends/gamertc";

export class DamageSystem extends System {
  onTick = (entities: Entity[]) => {
    console.log("DamageSystem.onTick", entities);
  }
}
