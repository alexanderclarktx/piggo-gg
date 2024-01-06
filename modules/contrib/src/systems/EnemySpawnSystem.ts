import { Zombie } from "@piggo-legends/contrib";
import { Entity, SystemBuilder } from "@piggo-legends/core";

// EnemySpawnSystem spawns waves of enemies
export const EnemySpawnSystem: SystemBuilder = ({ game }) => {

  let wave = 0;
  let enemiesInWave: Record<string, Entity> = {};

  const onTick = (entities: Entity[]) => {
    // handle old entities
    Object.keys(enemiesInWave).forEach((id) => {
      if (!game.entities[id]) {
        delete enemiesInWave[id];
      }
    });

    if (Object.keys(enemiesInWave).length === 0) {
      spawnWave(wave++);
    }
  }

  const spawnWave = async (wave: number) => {
    const zombies = 2 + wave;

    for (let i = 0; i < zombies; i++) {
      const z = await Zombie();
      enemiesInWave[z.id] = z;
      game.addEntity(z);
    }
  }

  return { onTick }
}
