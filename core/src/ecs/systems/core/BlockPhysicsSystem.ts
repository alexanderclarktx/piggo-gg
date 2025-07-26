import { blocks, Collider, Entity, floor, Position, round, sign, SystemBuilder, XYZ } from "@piggo-gg/core"

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

          position.localVelocity.x = position.data.velocity.x
          position.localVelocity.y = position.data.velocity.y

          let wouldGo: XYZ = {
            x: x + velocity.x / 40 - 0.05 * sign(velocity.x),
            y: y + velocity.y / 40 + 0.05 * sign(velocity.y),
            z: z + velocity.z
          }

          let ijk = {
            x: floor((0.15 + wouldGo.x) / 0.3),
            y: floor((0.15 + wouldGo.y) / 0.3),
            z: floor((wouldGo.z) / 0.3)
          }

          const ySweep = blocks.hasIJK(ijk)
          // if (mode === "global") console.log(`ijk:${ijk.x},${ijk.y},${ijk.z} ySweep:${ySweep}`)

          if (ySweep) {

            const blockMin = {
              x: ijk.x * blockSize - 0.15,
              y: ijk.y * blockSize - 0.15,
              z: ijk.z * blockSize - blockSize,
            }

            const blockMax = {
              x: blockMin.x + blockSize,
              y: blockMin.y + blockSize,
              z: blockMin.z + blockSize,
            }

            if (velocity.y > 0 && wouldGo.y > blockMin.y) {
              if (mode === "local") {
                position.localVelocity.y = 0
              } else {
                position.data.y = round(blockMin.y - r, 2)
                position.data.velocity.y = 0
              }
            } else if (velocity.y < 0 && wouldGo.y < blockMax.y) {
              if (mode === "local") {
                position.localVelocity.y = 0
              } else {
                position.data.y = round(blockMax.y + r, 2)
                position.data.velocity.y = 0
              }
            }

            // // Clamp each axis independently based on which direction it's trying to enter from
            // if (velocity.x > 0 && wouldGo.x > blockMin.x) {
            //   const was = position.data.x

            //   position.data.x = round(blockMin.x - r, 2)
            //   position.data.velocity.x = 0

            //   // console.log(`Collided ijk: ${ijk.x} clamped: x:${position.data.x} was: ${was}`)

            // } else if (velocity.x < 0 && wouldGo.x < blockMax.x) {
            //   const was = position.data.x

            //   position.data.x = round(blockMax.x + r, 2)
            //   position.data.velocity.x = 0

            //   console.log(`COLLIDED  clamped: ${position.data.x} was: ${was} blockMax: ${blockMax.x}`)
            // }

            // if (mode === "local") return
          }

          wouldGo = {
            x: x + velocity.x / 40 + 0.05 * sign(velocity.x),
            y: y + velocity.y / 40 - 0.05 * sign(velocity.y),
            z: z + velocity.z
          }

          ijk = {
            x: floor((0.15 + wouldGo.x) / 0.3),
            y: floor((0.15 + wouldGo.y) / 0.3),
            z: floor((wouldGo.z) / 0.3)
          }

          const xSweep = blocks.hasIJK(ijk)

          if (xSweep) {

            const blockMin = {
              x: ijk.x * blockSize - 0.15,
              y: ijk.y * blockSize - 0.15,
              z: ijk.z * blockSize - blockSize,
            }

            const blockMax = {
              x: blockMin.x + blockSize,
              y: blockMin.y + blockSize,
              z: blockMin.z + blockSize,
            }

            if (velocity.x > 0) {
              if (mode === "local") {
                position.localVelocity.x = 0
              } else {
                position.data.x = round(blockMin.x - r, 2)
                position.data.velocity.x = 0
              }
            } else if (velocity.x < 0) {
              if (mode === "local") {
                position.localVelocity.x = 0
              } else {
                position.data.x = round(blockMax.x + r, 2)
                position.data.velocity.x = 0
              }
            }
          }

          if (!ySweep && !xSweep) {
            wouldGo = {
              x: x + velocity.x / 40 + 0.05 * sign(velocity.x),
              y: y + velocity.y / 40 + 0.05 * sign(velocity.y),
              z: z + velocity.z
            }

            ijk = {
              x: floor((0.15 + wouldGo.x) / 0.3),
              y: floor((0.15 + wouldGo.y) / 0.3),
              z: floor((wouldGo.z) / 0.3)
            }

            const cornerSweep = blocks.hasIJK(ijk)

            if (cornerSweep) {
              const blockMin = {
                x: ijk.x * blockSize - 0.15,
                y: ijk.y * blockSize - 0.15,
                z: ijk.z * blockSize - blockSize,
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
                    position.localVelocity.x = 0
                  } else {
                    position.data.x = round(blockMin.x - r, 2)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                    position.localVelocity.y = 0
                  }
                  else {
                    position.data.y = round(blockMin.y - r, 2)
                    position.data.velocity.y = 0
                  }
                }
              } else if (velocity.x < 0 && velocity.y > 0) {
                const distX = Math.abs(blockMax.x - wouldGo.x)
                const distY = Math.abs(blockMin.y - wouldGo.y)

                if (distY > distX) {
                  if (mode === "local") {
                    position.localVelocity.x = 0
                  } else {
                    position.data.x = round(blockMax.x + r, 2)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                    position.localVelocity.y = 0
                  } else {
                    position.data.y = round(blockMin.y - r, 2)
                    position.data.velocity.y = 0
                  }
                }
              } else if (velocity.x > 0 && velocity.y < 0) {
                const distX = Math.abs(blockMin.x - wouldGo.x)
                const distY = Math.abs(blockMax.y - wouldGo.y)

                if (distY > distX) {
                  if (mode === "local") {
                    position.localVelocity.x = 0
                  } else {
                    position.data.x = round(blockMin.x - r, 2)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                    position.localVelocity.y = 0
                  } else {
                    position.data.y = round(blockMax.y + r, 2)
                    position.data.velocity.y = 0
                  }
                }
              } else if (velocity.x < 0 && velocity.y < 0) {
                const distX = Math.abs(blockMax.x - wouldGo.x)
                const distY = Math.abs(blockMax.y - wouldGo.y)

                if (distY > distX) {
                  if (mode === "local") {
                    position.localVelocity.x = 0
                  } else {
                    position.data.x = round(blockMax.x + r, 2)
                    position.data.velocity.x = 0
                  }
                } else {
                  if (mode === "local") {
                    position.localVelocity.y = 0
                  }
                  else {
                    position.data.y = round(blockMax.y + r, 2)
                    position.data.velocity.y = 0
                  }
                }
              }
            }
          }

          if (mode === "local") return

          // gravity & z
          if (position.data.velocity.z || position.data.z) {

            // apply stop
            const wouldGo = position.data.z + position.data.velocity.z
            if (position.data.stop <= position.data.z && wouldGo < position.data.stop) {
              position.data.z = position.data.stop
            } else {
              position.data.z = wouldGo
            }

            // set standing
            if (position.data.z === position.data.stop) {
              position.data.velocity.z = 0
              position.data.standing = true
            } else {
              position.data.standing = false
              if (!position.data.flying) {
                position.data.velocity.z -= position.data.gravity
              }
            }
          } else {
            position.data.standing = true
          }

          // flying direction
          if (position.data.flying) {
            position.data.velocity.z = (position.data.aim.y + 0.2) * 0.1
          }

          // Move the entity
          const was = position.data.x
          position.data.x += position.data.velocity.x / 40
          // console.log("was", was, "now", position.data.x, mode, entity.id, world.tick)
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
