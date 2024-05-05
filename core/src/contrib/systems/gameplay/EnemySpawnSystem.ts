import { PositionProps, SystemBuilder, Zombie } from "@piggo-gg/core";

const spawnLocations: PositionProps[] = [
  { x: 100, y: 100 }, { x: 100, y: 600 },
  { x: 200, y: 200 }, { x: 200, y: 500 },
  { x: 300, y: 300 }, { x: 300, y: 400 },
  { x: 400, y: 400 }, { x: 400, y: 300 }
]

// EnemySpawnSystem spawns waves of enemies
export const EnemySpawnSystem: SystemBuilder<"EnemySpawnSystem"> = ({
  id: "EnemySpawnSystem",
  init: ({ world }) => {

    const data: { wave: number, lastSpawnIndex: number, zombies: string[] } = {
      wave: 0,
      lastSpawnIndex: 0,
      zombies: []
    }

    const nextSpawnPosition = (): PositionProps => {
      data.lastSpawnIndex++;
      return spawnLocations[data.lastSpawnIndex % spawnLocations.length];
    }

    const spawnWave = async (wave: number) => {
      const zombies = 1 + wave;

      for (let i = 0; i < zombies; i++) {
        const z = Zombie({ id: `zombie-wave${wave}-${i}`, positionProps: nextSpawnPosition() });
        data.zombies.push(z.id);
        world.addEntity(z);
      }
    }

    return {
      id: "EnemySpawnSystem",
      data,
      onTick: () => {

        // handle old entities
        data.zombies.forEach((id) => {
          if (!world.entities[id]) {
            data.zombies = data.zombies.filter((zid) => zid !== id);
          }
        });
  
        // spawn new wave
        if (data.zombies.length === 0) {
          spawnWave(data.wave++);
        }
      }
    }
  }
});
