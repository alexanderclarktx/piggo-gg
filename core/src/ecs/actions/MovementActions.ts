import { Action, Character, Noob, XY, closestEntity } from "@piggo-gg/core";

export const Head = Action<XY>(({ params, entity }) => {
  if (!entity) return;

  const { position } = entity.components;

  position?.setHeading({ x: params.x, y: params.y });
});

export const Move = Action<XY>(({ params, entity }) => {
  if (!entity) return;

  const { position } = entity.components;

  position?.setHeading({ x: NaN, y: NaN });
  position?.setVelocity({ x: params.x, y: params.y });
});

export const Chase = Action(({ world, entity }) => {
  if (!entity) return;

  const { position } = entity.components;
  if (!position) return;

  const players = world.queryEntities(["player"]) as Noob[];
    let characters: Character[] = [];
    players.forEach((player) => {
      const character = player.components.controlling.getControlledEntity(world);
      if (character) characters.push(character);
    });

    // find the closest player entity position
    const closest = closestEntity(characters, position.data);
    if (!closest) return;

    position.setHeading(closest.components.position.data);
});
