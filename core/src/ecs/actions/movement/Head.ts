import { Action, XY } from "@piggo-gg/core"

export const Head = Action<XY>("head", ({ params, entity }) => {
  if (!entity) return

  const { position } = entity.components

  position?.setHeading({ x: params.x, y: params.y })
})
