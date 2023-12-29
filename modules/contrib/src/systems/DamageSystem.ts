import { Entity, Game, GameProps, Renderer, System } from "@piggo-legends/core";

export const DamageSystem = (): System => {
  const onTick = (__: Entity[], _: Game<GameProps>) => {
    // console.log("DamageSystem.onTick", entities);
  }

  return {
    componentTypeQuery: ["health", "damage"],
    onTick
  }
}
