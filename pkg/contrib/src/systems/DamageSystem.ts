import { Entity, Game, GameProps, Renderer, System } from "@piggo-legends/core";

export const DamageSystem = (renderer: Renderer): System => {
  const onTick = (__: Entity[], _: Game<GameProps>) => {
    // console.log("DamageSystem.onTick", entities);
  }

  return {
    renderer,
    componentTypeQuery: ["health", "damage"],
    onTick
  }
}
