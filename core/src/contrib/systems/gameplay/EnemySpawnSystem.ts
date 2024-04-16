import { Entity, PositionProps, SystemBuilder, Zombie } from "@piggo-gg/core";

const spawnLocations = [
  { x: 100, y: 100 }, { x: 100, y: 600 },
  { x: 200, y: 200 }, { x: 200, y: 500 },
  { x: 300, y: 300 }, { x: 300, y: 400 },
  { x: 400, y: 400 }, { x: 400, y: 300 },
  { x: 500, y: 500 }, { x: 500, y: 200 },
  { x: 600, y: 600 }, { x: 600, y: 100 }
]

// EnemySpawnSystem spawns waves of enemies
export const EnemySpawnSystem: SystemBuilder<"EnemySpawnSystem"> = ({
  id: "EnemySpawnSystem",
  init: ({ world }) => {

    const enemiesInWave: Record<string, Entity> = {};

    const data: { wave: number, lastSpawnIndex: number } = {
      wave: 0,
      lastSpawnIndex: 0,
    }

    const nextSpawnPosition = (): PositionProps => {
      const p: PositionProps = { ...spawnLocations[data.lastSpawnIndex++] }
      data.lastSpawnIndex %= spawnLocations.length;
      return p;
    }

    const onTick = () => {

      // handle old entities
      Object.keys(enemiesInWave).forEach((id) => {
        if (!world.entities[id]) {
          delete enemiesInWave[id];
        }
      });

      // kill zombies with 0 health
      Object.keys(enemiesInWave).forEach((id) => {
        if ((enemiesInWave[id] && enemiesInWave[id].components.health) && (enemiesInWave[id].components.health!.data.health <= 0)) {
          world.removeEntity(id);
          delete enemiesInWave[id];
        }
      });

      // spawn new wave
      if (Object.keys(enemiesInWave).length === 0) spawnWave(data.wave++);
    }

    const spawnWave = async (wave: number) => {
      const zombies = 1 + wave;

      for (let i = 0; i < zombies; i++) {
        const z = Zombie({ id: `zombie-${i}`, positionProps: nextSpawnPosition() });
        enemiesInWave[z.id] = z;
        world.addEntity(z);
      }
    }

    return {
      id: "EnemySpawnSystem",
      onTick,
      data,
      onRollback: () => {
        Object.keys(enemiesInWave).forEach((id) => {
          world.removeEntity(id);
          delete enemiesInWave[id];
        });
      }
    }
  }
});
