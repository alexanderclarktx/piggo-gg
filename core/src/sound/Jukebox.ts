import { Entity, pixiGraphics, Position, randomInt, Renderable } from "@piggo-gg/core"
import { Graphics } from "pixi.js/lib"

type State = "stop" | "play"

export const Jukebox = (): Entity => {

  let discMarks: Graphics | null = null
  let arm: Graphics | null = null

  let state: State = "stop"

  const jukebox = Entity({
    id: "jukebox",
    components: {
      position: Position({ x: 400, y: 100, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        onRender: () => {
          if (!discMarks || !arm) return

          // rotate the disc
          if (state === "play") discMarks.rotation += 0.01

          // rotate the arm
          if (state === "play" && arm.rotation < 0) arm.rotation += 0.008
          if (state === "stop" && arm.rotation > -0.92) arm.rotation -= 0.008
        },
        setChildren: async (_, world) => {

          const baseRenderable = Renderable({
            setup: async (r) => {
              r.c = pixiGraphics()
                .roundRect(-70, -70, 160, 140)
                .fill(0x472709)
                .stroke({ color: 0xffffff, width: 2 })

              r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })
            }
          })

          const other = Renderable({
            setup: async (r) => {
              const disc = pixiGraphics()
                .circle(0, 0, 50)
                .fill(0x1f1f1f)
                .stroke({ color: 0xcccccc, width: 2 })
                .circle(0, 0, 10)
                .fill(0x00aacc)
                .circle(0, 0, 2)
                .fill(0x000000)

              discMarks = pixiGraphics()
                .arc(0, 0, 40, 0, Math.PI / 2)
                .stroke({ color: 0xffffff, width: 2 })
                .arc(0, 0, 40, -Math.PI, -Math.PI / 2)
                .stroke({ color: 0xffffff, width: 2 })

              const armbase = pixiGraphics()
                .circle(70, -50, 5)
                .fill(0xe8e7e6)

              arm = pixiGraphics({ x: 70, y: -50, rotation: -0.92 })
                // .moveTo(90, -50)
                .lineTo(-42, 32)
                .stroke({ color: 0xe8e7e6, width: 3 })

              r.c.addChild(disc, discMarks, armbase, arm)
            }
          })

          const button = Renderable({
            setup: async (r) => {
              const button = pixiGraphics()
                .roundRect(50, 30, 30, 30, 10)
                .fill(0x00aacc)
                .fill({ color: 0x000000 })
              button.interactive = true

              button.on("pointerdown", () => {
                console.log("click")
                if (state === "stop") {
                  state = "play"
                  world.client?.soundManager.play("cassettePlay")
                } else {
                  state = "stop"
                  world.client?.soundManager.play("cassetteStop")
                }
              })
              r.c = button
            }
          })

          return [baseRenderable, other, button]
        }
      })
    }
  })
  return jukebox
}
