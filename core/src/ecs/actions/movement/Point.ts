import { Action, Oct, XY } from "@piggo-gg/core"

export const Point = Action<{ pointing: Oct, pointingDelta: XY, aim?: XY }>("point", ({ params, entity }) => {
  if (!entity) return

  const { position } = entity.components
  if (!position) return

  position.data.pointing = params.pointing
  position.data.pointingDelta = params.pointingDelta

  if (params.aim) {
    position.data.aim = params.aim
  }
})
