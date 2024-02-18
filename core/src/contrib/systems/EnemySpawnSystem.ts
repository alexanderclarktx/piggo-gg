import { Entity, PositionProps, SystemBuilder, Zombie } from "@piggo-legends/core";

const spawnLocations = [
  { x: 100, y: 100 }, { x: 100, y: 600 },
  { x: 200, y: 200 }, { x: 200, y: 500 },
  { x: 300, y: 300 }, { x: 300, y: 400 },
  { x: 400, y: 400 }, { x: 400, y: 300 },
  { x: 500, y: 500 }, { x: 500, y: 200 },
  { x: 600, y: 600 }, { x: 600, y: 100 }
]

// EnemySpawnSystem spawns waves of enemies
export const EnemySpawnSystem: SystemBuilder = ({ world }) => {

  const enemiesInWave: Record<string, Entity> = {};

  const data: { wave: number, lastSpawnIndex: number } = {
    wave: 0,
    lastSpawnIndex: 0,
  }

  const nextSpawnPosition = (): PositionProps => {
    const p: PositionProps = { ...spawnLocations[data.lastSpawnIndex++], renderMode: "isometric" }
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

    if (Object.keys(enemiesInWave).length === 0) {
      spawnWave(data.wave++);
    }
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
    data
  }
}
