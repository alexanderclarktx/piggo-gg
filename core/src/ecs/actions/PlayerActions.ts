import { Action, Controlling, InvokedAction, Noob, Skelly } from "@piggo-gg/core";

export const controlEntity: Action = Action(({ entity, player }) => {
  if (!entity || !player) return;

  player.components.controlling = new Controlling({ entityId: entity.id });
})

export const invokeSpawnSkelly = (player: Noob, color?: number): InvokedAction => ({
  action: "spawnSkelly", playerId: player.id, params: { color }
})

export const spawnSkelly = Action<{ color: number }>(({ player, world, params }) => {
  if (!player) return;

  const characterForPlayer = Skelly(`skelly-${player.id}`, player.components.team.data.team, params.color);
  player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
  world.addEntity(characterForPlayer);
})

export const changeTeam = Action(({ entity, world }) => {
  if (!entity) return;

  const { team, controlling } = entity.components;
  if (!team) return;

  team.data.team = team.data.team === 1 ? 2 : 1;

  if (controlling) {
    const character = world.entities[controlling.data.entityId];
    if (character && character.components.team) {
      character.components.team.data.team = team.data.team;
    }
  }
});
