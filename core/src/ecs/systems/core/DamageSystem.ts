import { Entity, Health, Position, SystemBuilder, playSound, randomChoice } from "@piggo-gg/core";

export const DamageSystem: SystemBuilder<"DamageSystem"> = {
  id: "DamageSystem",
  init: (world) => ({
    id: "DamageSystem",
    query: ["health", "position"],
    onTick: (entities: Entity<Health | Position>[]) => {
      entities.forEach((entity) => {
        const { health } = entity.components;
        if (health.data.health <= 0) {

          // play death sound
          if (health.deathSounds.length > 0) {
            playSound(world.client?.sounds[randomChoice(health.deathSounds)], 0.1);
          }

          // remove entity
          world.removeEntity(entity.id);
        }
      })
    }
  })
}
