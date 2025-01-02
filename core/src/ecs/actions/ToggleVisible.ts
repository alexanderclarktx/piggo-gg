import { Action } from "@piggo-gg/core"

export const ToggleVisible = Action(({ entity }) => {
  if (!entity) return

  const { renderable } = entity.components
  if (!renderable) return

  renderable.visible = true
})

export const ToggleHidden = Action(({ entity }) => {
  if (!entity) return

  const { renderable } = entity.components
  if (!renderable) return

  renderable.visible = false
})
