import { Action, Controlling, Entity, InvokedAction, Player, Skelly } from "@piggo-gg/core";

export const controlEntity: Action = Action(({ entity, player }) => {
  if (!entity || !player) return;

  player.components.controlling = new Controlling({ entityId: entity.id });
})

export const invokeSpawnSkelly = (player: Entity<Player>, color?: number): InvokedAction => ({
  action: "spawnSkelly", playerId: player.id, params: { color }
})

export const spawnSkelly = Action<{ color: number }>(({ player, world, params }) => {
  if (!player) return;

  const characterForPlayer = Skelly(`skelly-${player.id}`, params.color);
  player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
  world.addEntity(characterForPlayer);
})

export const changeTeam = Action(({ entity }) => {
  if (!entity) return;

  const { team } = entity.components;
  if (!team) return;

  team.data.team = team.data.team === 1 ? 2 : 1;
});
