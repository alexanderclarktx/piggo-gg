import { Action, Controlling, InvokedAction, Noob, Skelly, TeamColors, XY } from "@piggo-gg/core";

export const controlEntity: Action = Action(({ entity, player }) => {
  if (!entity || !player) return;

  player.components.controlling = Controlling({ entityId: entity.id });
})

export const invokeSpawnSkelly = (player: Noob, color?: number, pos?: XY): InvokedAction => ({
  action: "spawnSkelly", playerId: player.id, params: { color, pos }
})

export const spawnSkelly = Action<{ color: number, pos: XY }>(({ player, world, params }) => {
  if (!player) return;

  const characterForPlayer = Skelly(`skelly-${player.id}`, player.components.team.data.team, params.color, params.pos);
  player.components.controlling = Controlling({ entityId: characterForPlayer.id });
  world.addEntity(characterForPlayer);
})

export const switchTeam = Action(({ entity, world }) => {
  if (!entity) return;

  const { team, controlling } = entity.components;
  if (!team) return;

  // update player team
  team.switchTeam();

  if (controlling) {
    const character = world.entities[controlling.data.entityId];
    if (!character) return;

    const { team, renderable } = character.components;

    if (team) team.switchTeam();

    if (team && renderable) {
      renderable.prepareAnimations(TeamColors[team.data.team])
    }
  }
});
