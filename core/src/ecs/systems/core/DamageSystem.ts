import { Entity, Health, Position, SystemBuilder } from "@piggo-gg/core";

export const DamageSystem: SystemBuilder<"DamageSystem"> = {
  id: "DamageSystem",
  init: (world) => ({
    id: "DamageSystem",
    query: ["health", "position"],
    onTick: (entities: Entity<Health | Position>[]) => {
      entities.forEach((entity) => {
        const { health } = entity.components;

        if (health.data.health <= 0) {
          world.removeEntity(entity.id);
        }
      })
    }
  })
}
