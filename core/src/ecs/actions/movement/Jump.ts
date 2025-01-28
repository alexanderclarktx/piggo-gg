import { Action, KeyMouse } from "@piggo-gg/core"

export const Jump = Action<KeyMouse>("jump", ({ entity, params }) => {
  if (!entity) return

  if (params.hold) return

  const { position } = entity.components

  position?.setVelocity({ y: -200 })
}, 5)

// only allowed to jump if on the ground
export const JumpPlatform = Action<KeyMouse>("jumpPlatform", ({ entity, params }) => {
  if (!entity) return

  if (params.hold) return

  const { position } = entity.components

  if (position?.data.standing) position.setVelocity({ y: -250 })
}, 5)
