import { Action, LineWall, XY, abs, min, round, sign } from "@piggo-gg/core"

export const IceWall = Action<XY>("iceWall", ({ world, params, entity }) => {
  if (!entity || !entity.components.position) return

  const width = 50

  const { x: mouseX, y: mouseY } = params
  const { x, y } = entity.components.position.data

  // distance to mouse
  const dx = abs(mouseX - x)
  const dy = abs(mouseY - y)

  // sign
  const sx = sign(mouseX - x)
  const sy = sign(mouseY - y)

  // flip X axis
  const flip = sx === sy ? -1 : 1

  // ratios
  const rx = dx / (dx + dy)
  const ry = dy / (dx + dy)

  const coords = [
    mouseX - flip * min(width, (width * ry)), mouseY - min(width, (width * rx)),
    mouseX + flip * min(width, (width * ry)), mouseY + min(width, (width * rx))
  ].map(round)

  world.addEntity(LineWall({ points: coords, visible: true, hp: 30, hittable: false }))

  world.client?.soundManager.play(["wallPlace1", "wallPlace2"])

}, 100)
