import { Entity, loadTexture, pixiAnimation, Renderable, World, Position, Dynamic, Action } from "@piggo-gg/core";

export type Skin = (r: Renderable) => Promise<void>
type AnimationSelect = (entity: Entity<Position | Renderable>, world: World) => string

export const ChangeSkin = Action<{ skin: Skins }>("changeSkin", ({ params, entity }) => {
  const { skin } = params
  if (!skin || !entity) return

  const { renderable } = entity.components
  if (!renderable) return

  renderable.data.desiredSkin = skin
})

export const DudeSkin = (color: "red" | "blue" | "white"): Skin => async (r) => {
  const t = await loadTexture(`dude-${color}.json`)

  r.animations = {
    run: pixiAnimation([t["run1"], t["run2"], t["run4"], t["run5"]]),
    jump: pixiAnimation([t["jump3"], t["jump1"]]),
    idle: pixiAnimation([t["idle1"], t["idle2"], t["idle3"], t["idle4"]]),
    spike: pixiAnimation([t["spike5"], t["spike5"]])
  }
}

export const VolleyCharacterAnimations: AnimationSelect = (entity) => {
  const { position, renderable } = entity.components

  if (renderable.activeAnimation === "spike" && renderable.animation &&
    (renderable.animation.currentFrame + 1 !== renderable.animation.totalFrames)) {
    return "spike"
  }

  if (position.data.velocity.x || position.data.velocity.y) {
    return "run"
  }

  return "idle"
}

export const VolleyCharacterDynamic: Dynamic = ({ entity, world }) => {
  const { position, renderable } = entity.components

  if (position.data.velocity.x !== 0) {
    const x = world.flipped() * ((position.data.velocity.x > 0) ? 1 : -1)
    renderable.setScale({ x, y: 1 })
  }
}

export const Ghost: Skin = async (r) => {
  const t = await loadTexture("ghost.json")

  r.animations = {
    run: pixiAnimation([t["run1"], t["run2"], t["run4"], t["run5"]]),
    jump: pixiAnimation([t["jump3"], t["jump1"]]),
    idle: pixiAnimation([t["idle1"], t["idle2"], t["idle3"], t["idle4"]]),
    spike: pixiAnimation([t["spike3"], t["spike3"]])
  }
}

export type Skins = "dude-white" | "dude-red" | "dude-blue" | "ghost"

export const Skins: Record<Skins, Skin> = {
  "dude-white": DudeSkin("white"),
  "dude-red": DudeSkin("red"),
  "dude-blue": DudeSkin("blue"),
  "ghost": Ghost
}
