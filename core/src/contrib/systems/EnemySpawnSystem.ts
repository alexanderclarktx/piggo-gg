import { Entity, World, Zombie } from "@piggo-legends/core";

// EnemySpawnSystem spawns waves of enemies
export const EnemySpawnSystem = (world: World) => {

  let wave = 0;
  let enemiesInWave: Record<string, Entity> = {};

  const onTick = () => {
    // handle old entities
    Object.keys(enemiesInWave).forEach((id) => {
      if (!world.entities[id]) {
        delete enemiesInWave[id];
      }
    });

    if (Object.keys(enemiesInWave).length === 0) {
      spawnWave(wave++);
    }
  }

  const spawnWave = async (wave: number) => {
    const zombies = 1 + wave;

    for (let i = 0; i < zombies; i++) {
      const z = Zombie(`zombie-${i}`);
      enemiesInWave[z.id] = z;
      world.addEntity(z);
    }
  }

  return { onTick }
}
