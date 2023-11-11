import { Entity, Game, GameProps, System } from "@piggo-legends/core";

export class DamageSystem extends System {
  componentTypeQuery = ["health", "damage"];

  onTick = (__: Entity[], _: Game<GameProps>) => {
    // console.log("DamageSystem.onTick", entities);
  }
}
