import {
  Action, cos, DDEState, playerForCharacter, Position,
  sin, sqrt, XY, XYZ, XYZdistance, XYZdot, XYZsub
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

  let insideBlock: XYZ = {
    x: (eyePos.x + 1 * dir.x) / 0.3,
    y: (eyePos.y + 1 * dir.y) / 0.3,
    z: (eyePos.z + 1 * dir.z) / 0.3
  }

  if (world.blocks.hasIJK(insideBlock)) {
    world.blocks.remove(insideBlock)
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