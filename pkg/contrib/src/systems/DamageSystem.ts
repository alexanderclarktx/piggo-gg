import { Entity, EntityProps, Game, GameProps, System, SystemProps } from "@piggo-legends/core";

export class DamageSystem extends System<SystemProps> {
  componentTypeQuery = ["health", "damage"];

  onTick = (__: Entity<EntityProps>[], _: Game<GameProps>) => {
    // console.log("DamageSystem.onTick", entities);
  }
}
