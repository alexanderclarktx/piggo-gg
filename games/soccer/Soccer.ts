import {
  Background, Goal, SpawnSystem, Skelly, GameBuilder, DefaultUI,
  CameraSystem, Entity, LineWall, Position, Renderable, Collider,
  Debug, loadTexture, Networked, NPC, XY
} from "@piggo-gg/core"
import { Graphics, Sprite } from "pixi.js"

export const Soccer: GameBuilder = {
  id: "soccer",
  init: (world) => ({
    id: "soccer",
    state: {},
    entities: [
      ...DefaultUI(world),
      Background(), FieldGrass(), FieldWall(),
      Ball({ id: "ball", position: { x: 50, y: 150 } }),
      Goal({ id: "goal1", color: 0xff0000, position: { x: -402, y: 150 }, width: 49, length: 2 }),
      Goal({ id: "goal2", color: 0x0000ff, position: { x: 502, y: 150 }, width: 49, length: 2 }),
    ],
    systems: [CameraSystem(), SpawnSystem(Skelly)],
    netcode: "delay"
  })
}

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
  return LineWall({ points: wallPoints, position: { x: 0, y: -200 }, hittable: false })
}

export const FieldGrass = (wallPoints: number[] = defaultPoints) => Entity({
  id: "field",
  components: {
    position: Position({ x: 0, y: -200 }),
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
        lines.moveTo(502, 260)
        lines.lineTo(460, 260)
        lines.lineTo(460, 440)
        lines.lineTo(502, 440)

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

export type BallProps = {
  id: string
  position?: XY
}

const Ball = ({ position, id }: BallProps) => Entity({
  id: id,
  components: {
    position: Position(position ?? { x: 50, y: 250 }),
    networked: Networked(),
    collider: Collider({
      shape: "ball",
      radius: 6,
      frictionAir: 0.4,
      mass: 20,
      restitution: 0.9
    }),
    debug: Debug(),
    npc: NPC({
      behavior: (e: Entity<Position>) => {
        const { x, y } = e.components.position.data.velocity
        e.components.position.data.rotation += 0.001 * Math.sqrt((x * x) + (y * y))
      }
    }),
    renderable: Renderable({
      zIndex: 3,
      rotates: true,
      interpolate: true,
      scale: 0.7,
      setup: async (r: Renderable) => {

        const texture = (await loadTexture("ball.json"))["ball"]
        const sprite = new Sprite(texture)

        sprite.anchor.set(0.5, 0.5)

        r.c = sprite
      }
    })
  }
})

