import { Action, XY } from "@piggo-gg/core"

export const Move = Action<XY>("move", ({ params, entity }) => {
  if (!entity) return

  const { position } = entity.components

  position?.setHeading({ x: NaN, y: NaN })
  position?.setVelocity({ x: params.x, y: params.y })
})
