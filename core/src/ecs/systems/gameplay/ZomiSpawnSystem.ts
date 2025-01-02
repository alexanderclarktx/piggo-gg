import { PositionProps, SystemBuilder, Zomi } from "@piggo-gg/core"

const spawnLocations: PositionProps[] = [
  { x: -100, y: 400 },
  { x: -100, y: 600 },
  { x: -200, y: 400 },
  { x: -200, y: 600 },
  { x: -300, y: 400 },
  { x: -300, y: 600 },
  { x: -400, y: 400 },
  { x: -400, y: 600 }
]

// ZomiSpawnSystem spawns waves of zomis
export const ZomiSpawnSystem: SystemBuilder<"ZomiSpawnSystem"> = ({
  id: "ZomiSpawnSystem",
  init: (world) => {

    const data: { wave: number, lastSpawnIndex: number, zomis: string[] } = {
      wave: 0,
      lastSpawnIndex: 0,
      zomis: []
    }

    const nextSpawnPosition = (): PositionProps => {
      data.lastSpawnIndex++
      return spawnLocations[data.lastSpawnIndex % spawnLocations.length]
    }

    const spawnWave = async (wave: number) => {
      const zomis = 1 + wave

      for (let i = 0; i < zomis; i++) {
        const z = Zomi({ id: `zomi-wave${wave}-${i}`, positionProps: nextSpawnPosition() })
        data.zomis.push(z.id)
        world.addEntity(z)
      }
    }

    return {
      id: "ZomiSpawnSystem",
      data,
      query: [],
      onTick: () => {

        // handle old entities
        data.zomis.forEach((id) => {
          if (!world.entities[id]) {
            data.zomis = data.zomis.filter((zid) => zid !== id)
          }
        })
  
        // spawn new wave
        if (data.zomis.length === 0) {
          spawnWave(data.wave++)
        }
      }
    }
  }
})
