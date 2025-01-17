import { Action, KeyMouse } from "@piggo-gg/core"

export const Jump = Action<KeyMouse>("jump", ({ entity, params }) => {
  if (!entity) return
  
  if (params.hold) return

  const { position } = entity.components

  position?.setVelocity({ y: -220 })
}, 10)
