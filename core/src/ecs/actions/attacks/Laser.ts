import {
  Action, cos, DDEState, floor, hypot, min, playerForCharacter,
  Position, sin, sqrt, XY, XYZ, XYZdistance, XYZdot, XYZsub
} from "@piggo-gg/core"
import { Vector3 } from "three"

export type Target = XYZ & { id: string }

export type LaserParams = {
  pos: XYZ
  aim: XY
  targets: Target[]
}

export const Laser = Action<LaserParams>("laser", ({ world, params, entity, player }) => {
  if (!entity) return

  const state = world.state<DDEState>()

  if (state.hit[entity.id]) return

  const cd = world.tick - (state.lastShot[entity.id] ?? 0)
  if (cd < 20) return

  state.lastShot[entity.id] = world.tick

  world.client?.sound.play({ name: "laser1", threshold: { pos: params.pos, distance: 5 } })

  // find target from camera
  const camera = new Vector3(params.pos.x, params.pos.z + 0.2, params.pos.y)

  // fixed distance along dir (for now)
  const target = new Vector3(
    -sin(params.aim.x),
    -0.33 + params.aim.y,
    -cos(params.aim.x)
  ).normalize().multiplyScalar(10).add(camera)

  const eyePos = { x: params.pos.x, y: params.pos.y, z: params.pos.z + 0.13 }
  const eyes = new Vector3(eyePos.x, eyePos.z, eyePos.y)
  const dir = target.clone().sub(eyes).normalize()

  const laser = world.three?.birdAssets[entity.id]?.laser
  if (laser) {
    const offset = new Vector3(-sin(params.aim.x), 0, -cos(params.aim.x)).normalize()
    laser.position.copy(eyes.add(offset.multiplyScalar(.03)))
    laser.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir)

    laser.updateMatrix()
    laser.material.opacity = 1
    laser.visible = true
  }

  const current = { ...eyePos }

  let travelled = 0
  let cap = 20

  while (travelled < 10 && cap > 0) {

    const xGap = (current.x + 0.15) % 0.3
    const yGap = (current.y + 0.15) % 0.3
    const zGap = current.z % 0.3

    // find minimum step size to go to next block
    const xStep = dir.x > 0 ? (0.3 - xGap) / dir.x : (xGap / -dir.x)
    const yStep = dir.z > 0 ? (0.3 - yGap) / dir.z : (yGap / -dir.z)
    const zStep = dir.y > 0 ? (0.3 - zGap) / dir.y : (zGap / -dir.y)

    const minStep = min(xStep, yStep, zStep)
    // console.log("step", xStep.toFixed(2), yStep.toFixed(2), zStep.toFixed(2))
    // console.log("xstep", xStep, "xGap", xGap, "current.x", current.x, "0.3 - xGap", 0.3 - xGap)

    const xDist = dir.x * minStep * 1.01
    const yDist = dir.z * minStep * 1.01
    const zDist = dir.y * minStep * 1.01

    current.x += xDist
    current.y += yDist
    current.z += zDist

    travelled += hypot(xDist, yDist, zDist)
    cap -= 1

    const insideBlock = {
      x: floor((0.15 + current.x) / 0.3),
      y: floor((0.15 + current.y) / 0.3),
      z: floor(current.z / 0.3)
    }

    if (world.blocks.hasIJK(insideBlock)) {
      world.blocks.remove(insideBlock)
      break
    }
  }

  // if (world.client && entity.id !== world.client.playerCharacter()?.id) return
  if (world.client) return

  const otherDucks = params.targets as Target[]
  for (const duck of otherDucks) {
    if (state.hit[duck.id]) continue
    const duckEntity = world.entity<Position>(duck.id)
    if (!duckEntity) continue

    duck.z += 0.02

    const L = XYZsub(duck, eyePos)
    const tc = XYZdot(L, { x: dir.x, y: dir.z, z: dir.y })

    if (tc < 0) continue

    const Ldist = XYZdistance(duck, eyePos)
    const D = sqrt((Ldist * Ldist) - (tc * tc))

    if (D > 0 && D < 0.09) {
      state.hit[duck.id] = { tick: world.tick, by: entity.id }
      const duckPlayer = playerForCharacter(world, duck.id)
      world.announce(`${player?.components.pc.data.name} hit ${duckPlayer?.components.pc.data.name}`)

      duckEntity.components.position.data.velocity.z = -0.05
      duckEntity.components.position.data.flying = false
    }
  }
})
