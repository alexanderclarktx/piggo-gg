import { Entity, System } from "@piggo-legends/ecstacy";

export class DamageSystem extends System {
  name: string;
  onTick = (entities: Entity[]) => {
    console.log("DamageSystem.onTick", entities);
  }
}
