import {
  blocks, Collider, Entity, floor, Position, round, sign, SystemBuilder
} from "@piggo-gg/core"

export const BlockPhysicsSystem = (mode: "global" | "local") => SystemBuilder({
  id: mode === "global" ? "BlockPhysicsSystem" : "LocalBlockPhysicsSystem",
  init: (world) => {

    if (mode === "local" && world.mode === "server") return undefined

    const blockSize = 0.3
    const r = 0.05

    return {
      id: mode === "global" ? "BlockPhysicsSystem" : "LocalBlockPhysicsSystem",
      query: ["position", "collider"],
      priority: mode === "global" ? 7 : 9,
      onTick: (entities: Entity<Position | Collider>[]) => {
        for (const entity of entities) {
          const { position, collider } = entity.components

          if (collider.isStatic) continue

          const { velocity, x, y, z } = position.data

          position.localVelocity = { ...position.data.velocity }

          // zSweep

          let wouldGo = {
            x, y,
            z: z + velocity.z + 0.1 * sign(velocity.z)
          }

          let ijk = {
            x: floor((0.15 + wouldGo.x) / 0.3),
            y: floor((0.15 + wouldGo.y) / 0.3),
            z: floor((0.01 + wouldGo.z) / 0.3)
          }

          const zSweep = blocks.hasIJK(ijk)

          if (zSweep) {
            // if (mode === "global") console.log("zSweep", world.tick)

            const blockMin = {
              x: ijk.x * blockSize - 0.15,
              y: ijk.y * blockSize - 0.15,
              z: ijk.z * blockSize
            }

            const blockMax = {
              x: blockMin.x + blockSize,
              y: blockMin.y + blockSize,
              z: blockMin.z + blockSize
            }

            if (velocity.z > 0 && wouldGo.z > blockMin.z) {
              if (mode === "local") {
                position.localVelocity.z = round(blockMin.z - 0.1, 3) - position.data.z
              } else {
                position.data.z = round(blockMin.z - 0.1, 3)
                position.data.velocity.z = 0
                position.data.standing = false
              }
            } else if (velocity.z < 0 && wouldGo.z + 0.1 < blockMax.z) {
              if (mode === "local") {
                position.localVelocity.z = round(blockMax.z, 3) - position.data.z
              } else {
                position.data.z = round(blockMax.z, 3)
                position.data.velocity.z = 0
                position.data.standing = true
              }
            } else if (mode !== "local") {
              position.data.standing = false
              position.data.z += position.data.velocity.z
            }
          } else if (mode !== "local") {
            position.data.standing = false
            position.data.z += position.data.velocity.z
          }

          // ySweep

          wouldGo = {
            x: x,
            y: y + velocity.y / 40 + 0.05 * sign(velocity.y),
            z: z
          }

          ijk = {
            x: floor((0.15 + wouldGo.x) / 0.3),
            y: floor((0.15 + wouldGo.y) / 0.3),
            z: floor((0.01 + wouldGo.z) / 0.3)
          }

          const ySweep = blocks.hasIJK(ijk)

          if (ySweep) {
            // if (mode === "global") console.log("ySweep", world.tick)

            const blockMin = {
              x: ijk.x * blockSize - 0.15,
              y: ijk.y * blockSize - 0.15,
              z: ijk.z * blockSize
            }

            const blockMax = {
              x: blockMin.x + blockSize,
              y: blockMin.y + blockSize,
              z: blockMin.z + blockSize
            }

            if (velocity.y > 0 && wouldGo.y > blockMin.y) {
              if (mode === "local") {
                position.localVelocity.y = 40 * (round(blockMin.y - r, 3) - position.data.y)
              } else {
                position.data.y = round(blockMin.y - r, 3)
                position.data.velocity.y = 0
              }
            } else if (velocity.y < 0 && wouldGo.y < blockMax.y) {
              if (mode === "local") {
                position.localVelocity.y = 40 * (round(blockMax.y + r, 3) - position.data.y)
              } else {
                position.data.y = round(blockMax.y + r, 3)
                position.data.velocity.y = 0
              }
            }
          }

          // xSweep

          wouldGo = {
            x: x + velocity.x / 40 + 0.05 * sign(velocity.x),
            y: y,
            z: z
          }

          ijk = {
            x: floor((0.15 + wouldGo.x) / 0.3),
            y: floor((0.15 + wouldGo.y) / 0.3),
            z: floor((0.01 + wouldGo.z) / 0.3)
          }

          const xSweep = blocks.hasIJK(ijk)

          if (xSweep) {
            // if (mode === "global") console.log("xSweep", world.tick)

            const blockMin = {
              x: ijk.x * blockSize - 0.15,
              y: ijk.y * blockSize - 0.15,
              z: ijk.z * blockSize
            }

            const blockMax = {
              x: blockMin.x + blockSize,
              y: blockMin.y + blockSize,
              z: blockMin.z + blockSize,
            }

            if (velocity.x > 0) {
              if (mode === "local") {
                position.localVelocity.x = 40 * (round(blockMin.x - r, 3) - position.data.x)
              } else {
                position.data.x = round(blockMin.x - r, 3)
                position.data.velocity.x = 0
              }
            } else if (velocity.x < 0) {
              if (mode === "local") {
                position.localVelocity.x = 40 * (round(blockMax.x + r, 3) - position.data.x)
              } else {
                position.data.x = round(blockMax.x + r, 3)
                position.data.velocity.x = 0
              }
            }
          }

          // cornerSweep

          if (!ySweep && !xSweep) {
            wouldGo = {
              x: x + velocity.x / 40 + 0.05 * sign(velocity.x),
              y: y + velocity.y / 40 + 0.05 * sign(velocity.y),
              z: z
            }

            ijk = {
              x: floor((0.15 + wouldGo.x) / 0.3),
              y: floor((0.15 + wouldGo.y) / 0.3),
              z: floor((0.01 + wouldGo.z) / 0.3)
            }

            const cornerSweep = blocks.hasIJK(ijk)

            if (cornerSweep) {
              // if (mode === "global") console.log("cornerSweep", world.tick)
              const blockMin = {
                x: ijk.x * blockSize - 0.15,
                y: ijk.y * blockSize - 0.15,
                z: ijk.z * blockSize
              }

              const blockMax = {
                x: blockMin.x + blockSize,
                y: blockMin.y + blockSize,
                z: blockMin.z + blockSize,
              }

              if (velocity.x > 0 && velocity.y > 0) {
                const distX = Math.abs(blockMin.x - wouldGo.x)
                const distY = Math.abs(blockMin.y - wouldGo.y)

                if (distY > distX) {
                  if (mode === "local") {
                    // position.localVelocity.x = 0
                  } else {
                    position.data.x = round(blockMin.x - r, 3)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                    // position.localVelocity.y = 0
                  }
                  else {
                    position.data.y = round(blockMin.y - r, 3)
                    position.data.velocity.y = 0
                  }
                }
              } else if (velocity.x < 0 && velocity.y > 0) {
                const distX = Math.abs(blockMax.x - wouldGo.x)
                const distY = Math.abs(blockMin.y - wouldGo.y)

                if (distY > distX) {
                  if (mode === "local") {
                    // position.localVelocity.x = 0
                  } else {
                    position.data.x = round(blockMax.x + r, 3)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                    // position.localVelocity.y = 0
                  } else {
                    position.data.y = round(blockMin.y - r, 3)
                    position.data.velocity.y = 0
                  }
                }
              } else if (velocity.x > 0 && velocity.y < 0) {
                const distX = Math.abs(blockMin.x - wouldGo.x)
                const distY = Math.abs(blockMax.y - wouldGo.y)

                if (distY > distX) {
                  if (mode === "local") {
                    // position.localVelocity.x = 0
                  } else {
                    position.data.x = round(blockMin.x - r, 3)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                    // position.localVelocity.y = 0
                  } else {
                    position.data.y = round(blockMax.y + r, 3)
                    position.data.velocity.y = 0
                  }
                }
              } else if (velocity.x < 0 && velocity.y < 0) {
                const distX = Math.abs(blockMax.x - wouldGo.x)
                const distY = Math.abs(blockMax.y - wouldGo.y)

                if (distY > distX) {
                  if (mode === "local") {
                  } else {
                    position.data.x = round(blockMax.x + r, 3)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                  }
                  else {
                    position.data.y = round(blockMax.y + r, 3)
                    position.data.velocity.y = 0
                  }
                }
              }
            }
          }

          if (mode === "local") return

          if (position.data.flying) {
            position.data.velocity.z = (position.data.aim.y + 0.2) * 0.1
          } else {
            position.data.velocity.z -= position.data.gravity
          }

          // Move the entity
          position.data.x += position.data.velocity.x / 40
          position.data.y += position.data.velocity.y / 40

          // friction
          if (position.data.friction) {
            const scale = (position.data.standing && !position.data.flying) ? 0.8 : 0.98
            entity.components.position.scaleVelocity(scale)
          }
        }
      }
    }
  }
})
