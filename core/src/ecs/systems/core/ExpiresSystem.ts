import { Entity, Expires, SystemBuilder } from "@piggo-gg/core";

export const ExpiresSystem: SystemBuilder<"ExpiresSystem"> = {
  id: "ExpiresSystem",
  init: ({ world }) => ({
    id: "ExpiresSystem",
    query: ["expires"],
    onTick: (entities: Entity<Expires>[]) => {
      entities.forEach((entity) => {
        const { expires } = entity.components;

        expires.data.ticksLeft -= 1;

        if (expires.data.ticksLeft <= 0) {
          world.removeEntity(entity.id);
        }
      })
    }
  })
}
