import { Entity, MusicSounds, PixiButton, pixiGraphics, Position, Renderable } from "@piggo-gg/core"
import { Graphics } from "pixi.js/lib"

export const MusicBox = (): Entity => {

  let discMarks: Graphics | null = null
  let arm: Graphics | null = null
  let disc: Graphics | null = null

  let timeout = 40
  let animation = 0

  let state: "stop" | "play" = "stop"
  let tracks: MusicSounds[] = ["track1", "track2", "track3", "track5"]
  let trackIndex = 1

  let discColors: Record<MusicSounds, number> = {
    track1: 0x00bbdd,
    track2: 0xccaa00,
    track3: 0x00ccaa,
    track5: 0xcc99cc
  }

  const drawDisc = () => {
    if (disc === null) disc = pixiGraphics()
    disc.clear()
      .circle(0, 0, 50)
      .fill(0x1f1f1f)
      .stroke({ color: 0xcccccc, width: 2 })
      .circle(0, 0, 10)
      .fill(discColors[tracks[trackIndex]])
      .circle(0, 0, 2)
      .fill(0x000000)
  }

  const musicbox = Entity<Position>({
    id: "musicbox",
    persists: true,
    components: {
      position: Position({ x: 400, y: 550, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        onTick: ({ renderable, world }) => {
          if (timeout > 0) timeout -= 1

          if (state === "play" && animation > 0) animation -= 1

          if (state === "play" && timeout === 0 && world.client?.soundManager.sounds[tracks[trackIndex]]?.state === "stopped") {
            console.log("stopped")
            trackIndex = (trackIndex + 1) % tracks.length
            drawDisc()
            world.client?.soundManager.play(tracks[trackIndex], 0, "+1")
            timeout = 40
          }

          renderable.visible = (world.game.id === "lobby")
        },
        onRender: () => {
          if (!discMarks || !arm) return

          // rotate the disc
          if (state === "play" && animation === 0) discMarks.rotation += 0.008

          // rotate the arm
          if (state === "play" && arm.rotation < 0) arm.rotation += 0.008
          if (state === "stop" && arm.rotation > -0.92) arm.rotation -= 0.008
        },
        setChildren: async (renderer, world) => {

          const { width } = renderer.wh()
          musicbox.components.position.setPosition({ x: 220 + (width - 230) / 2 })

          const baseRenderable = Renderable({
            setup: async (r) => {
              r.c = pixiGraphics()
                .roundRect(-90, -70, 180, 140)
                .fill(0x472709)
                .stroke({ color: 0xffffff, width: 2 })

              r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })
            }
          })

          const other = Renderable({
            setup: async (r) => {
              drawDisc()

              discMarks = pixiGraphics()
                .arc(0, 0, 40, 0, Math.PI / 2)
                .stroke({ color: 0xffffff, width: 2 })
                .arc(0, 0, 40, -Math.PI, -Math.PI / 2)
                .stroke({ color: 0xffffff, width: 2 })

              const armbase = pixiGraphics()
                .circle(70, -50, 5)
                .fill(0xe8e7e6)

              arm = pixiGraphics({ x: 70, y: -50, rotation: state === "play" ? 0 : -0.92 })
                .lineTo(-42, 32)
                .stroke({ color: 0xe8e7e6, width: 3 })

              r.c.addChild(disc!, discMarks, armbase, arm)
            }
          })

          const buttonRenderable = Renderable({
            interactiveChildren: true,
            position: { x: 65, y: 45 },
            setup: async (r) => {

              const button = PixiButton({
                content: () => ({
                  text: " ", style: {
                    fontSize: 0, fill: 0x000000
                  },
                  strokeColor: state === "play" ? 0xff0000 : 0x00ff00,
                  width: 26, height: 26,
                }),
                onClick: () => {
                  if (timeout) return

                  if (!world.client?.soundManager.ready) {
                    setTimeout(() => { button.onClick?.() }, 100)
                    return
                  }

                  if (state === "stop") {
                    state = "play"
                    world.client?.soundManager.play("cassettePlay")
                    world.client?.soundManager.play(tracks[trackIndex], 0, "+1")
                    button.redraw(() => ({ text: " ", strokeColor: 0xff0000, style: {}, width: 26, height: 26 }))

                    timeout = 60
                    animation = 40
                  } else {
                    state = "stop"
                    world.client?.soundManager.play("cassetteStop")
                    world.client?.soundManager.stop(tracks[trackIndex])
                    button.redraw(() => ({ text: " ", strokeColor: 0x00ff00, style: {}, width: 26, height: 26 }))

                    trackIndex = (trackIndex + 1) % tracks.length
                    drawDisc()

                    timeout = 50
                  }
                },
                onEnter: () => {
                  buttonRenderable.setGlow({ outerStrength: 2 })
                },
                onLeave: () => {
                  buttonRenderable.setGlow({ outerStrength: 0 })
                },
              })

              r.c = button.c

              buttonRenderable.setBevel({ rotation: 90, lightAlpha: 0.6, shadowAlpha: 0.4 })
            }
          })

          return [baseRenderable, other, buttonRenderable]
        }
      })
    }
  })
  return musicbox
}
