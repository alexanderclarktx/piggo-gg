import { Entity, LineWall, Position, Renderable } from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export type WallPoints = [number, number][]

const defaultPoints: number[] = [
  -400, 100,
  -400, 300,
  -430, 300, // notch
  -430, 400, // notch
  -400, 400,
  -400, 600,
  +500, 600,
  +500, 400,
  +530, 400, // notch
  +530, 300, // notch
  +500, 300,
  +500, 100,
  -400, 100,
]

export const FieldWall = (wallPoints: number[] = defaultPoints): Entity => {
  return LineWall({ points: wallPoints, hittable: false })
}

export const FieldGrass = (wallPoints: number[] = defaultPoints) => Entity({
  id: "field",
  components: {
    position: Position({ x: 0, y: 0 }),
    renderable: Renderable({
      setup: async (r) => {

        // grass
        const grass = new Graphics()
        grass.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1 })
        grass.poly(wallPoints)
        grass.fill(0x008833).stroke()

        // field lines
        const lines = new Graphics()
        lines.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1 })
        lines.setFillStyle({ alpha: 0 })

        // center line
        lines.moveTo(50, 100)
        lines.lineTo(50, 600)

        // big circle
        lines.circle(50, 350, 75)

        // little circle
        lines.circle(49.5, 350, 2)

        // free kick line left
        lines.moveTo(-401, 208)
        lines.lineTo(-260, 208)
        lines.lineTo(-260, 492)
        lines.lineTo(-401, 492)

        // free kick line right
        lines.moveTo(502, 208)
        lines.lineTo(360, 208)
        lines.lineTo(360, 492)
        lines.lineTo(502, 492)

        // goalie line left
        // lines.moveTo(-401, 260)
        // lines.lineTo(-360, 260)
        // lines.lineTo(-360, 440)
        // lines.lineTo(-401, 440)

        // // goalie line right
        // lines.moveTo(502, 260)
        // lines.lineTo(460, 260)
        // lines.lineTo(460, 440)
        // lines.lineTo(502, 440)

        // free kick semicircle left
        lines.moveTo(-260, 400)
        lines.quadraticCurveTo(-210, 350, -260, 300)

        // free kick semicircle right
        lines.moveTo(360, 300)
        lines.quadraticCurveTo(310, 350, 360, 400)

        lines.stroke()

        r.c.addChild(grass, lines)
      },
    })
  }
})
