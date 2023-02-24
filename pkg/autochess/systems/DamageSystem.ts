import { Entity, System } from "@ts-game-project/ecstacy";

export class DamageSystem extends System {
  name: string;
  onTick = (entities: Entity[]) => {
    console.log("DamageSystem.onTick", entities);
  }
}
