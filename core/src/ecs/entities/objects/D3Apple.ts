import { DDEState, Entity, Networked, NPC, Position, World, XYZ, XYZdistance, XYZequal } from "@piggo-gg/core"
import { Group } from "three"

export const D3Apple = ({ id }: { id: string }): Entity<Position> => {

  let eaten = false

  let treeIndex: number = -1
  let tree: XYZ = { x: 0, y: 0, z: 0 }

  let mesh: Group | undefined = undefined

  const randomSpot = (world: World): XYZ => {
    treeIndex = world.random.int(world.trees.length - 1)

    tree = world.trees[treeIndex]

    const a = 0.52
    const b = 0.3
    const z = -0.24

    const randomSpot = world.random.choice([
      { x: a, y: 0, z: 0 }, { x: -a, y: 0, z: 0 },
      { x: 0, y: a, z: 0 }, { x: 0, y: -a, z: 0 },
      { x: b, y: 0, z }, { x: -b, y: 0, z },
      { x: 0, y: b, z }, { x: 0, y: -b, z }
    ])
    return { x: tree.x + randomSpot.x, y: tree.y + randomSpot.y, z: tree.z + randomSpot.z }
  }

  const apple = Entity<Position>({
    id,
    components: {
      position: Position(),
      networked: Networked(),
      npc: NPC({
        behavior: (_, world) => {

          // relocate the apple
          if (treeIndex === -1 || eaten || !world.trees[treeIndex] || !XYZequal(world.trees[treeIndex], tree)) {
            apple.components.position.setPosition(randomSpot(world))
            eaten = false
          }

          // render the apple
          if (!mesh && world.three?.apple) {
            mesh = world.three.apple.clone(true)
            world.three.scene.add(mesh)
          }

          // set mesh position
          const { x, y, z } = apple.components.position.data
          mesh?.position.set(x, z, y)

          // check if eaten
          for (const player of world.players()) {
            const character = player.components.controlling?.getCharacter(world)
            if (!character) continue

            const { position } = character.components
            const dist = XYZdistance(position.data, { x, y, z })

            if (dist < 0.16 && !eaten) {
              eaten = true

              // sound effect
              world.client?.soundManager.play({ soundName: "eat", start: 0.3, threshold: { pos: { x, y }, distance: 5 } })

              if (position.data.flying) return

              // update state
              const state = world.game.state as DDEState
              const playerId = player.id

              if (!state.applesEaten[playerId]) {
                state.applesEaten[playerId] = 1
                state.applesTimer[playerId] = world.tick
              } else {
                state.applesEaten[playerId] += 1
                player.components.pc.data.points += 1

                if (state.applesEaten[playerId] >= 10) {
                  const timeElapsed = (world.tick - state.applesTimer[playerId]) * 25 / 1000
                  console.log(`Player ${playerId} has eaten 10 apples!`, timeElapsed.toFixed(2), "seconds")

                  state.applesEaten[playerId] = 0
                  delete state.applesTimer[playerId]
                }
              }
            }
          }
        }
      })
    }
  })

  return apple
}
