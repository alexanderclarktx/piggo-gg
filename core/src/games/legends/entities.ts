import { Entity, Position, Renderable, addPoints, pointsIsometric } from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export const Rift = (wallPoints: number[]) => Entity({
  id: "rift",
  components: {
    position: Position({ x: 0, y: 0 }),
    renderable: Renderable({
      setup: async (r) => {

        const top = [0, 0]
        const right = [2500, 0]
        const bottom = [2500, 2500]
        const left = [0, 2500]

        // grass
        const grass = new Graphics()
        grass.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1 })
        grass.poly(wallPoints)
        grass.fill(0x008833)

        // top right
        const lanes = new Graphics()
        lanes.poly(pointsIsometric([
          addPoints(top, [200, 1]),
          addPoints(top, [200, 200]),
          addPoints(right, [-200, 200]),
          addPoints(right, [-200, 1]),
        ]))

        // top left
        lanes.poly(pointsIsometric([
          addPoints(top, [1, 200]),
          addPoints(top, [200, 200]),

          addPoints(left, [200, -200]),
          addPoints(left, [1, -200]),
        ]))

        // bot right
        lanes.poly(pointsIsometric([
          addPoints(bottom, [-200, -200]),
          addPoints(bottom, [-1, -200]),
          addPoints(right, [-1, 200]),
          addPoints(right, [-200, 200]),
        ]))

        // bot left
        lanes.poly(pointsIsometric([
          addPoints(left, [200, -200]),
          addPoints(left, [200, -1]),
          addPoints(bottom, [-200, -1]),
          addPoints(bottom, [-200, -200]),
        ]))

        // mid
        lanes.poly(pointsIsometric([
          addPoints(right, [-400, 200]),
          addPoints(right, [-200, 400]),
          addPoints(left, [400, -200]),
          addPoints(left, [200, -400]),
        ]))

        lanes.fill(0xf7c860)

        const spawns = new Graphics()

        // purple spawn
        spawns.poly(pointsIsometric([
          right,
          addPoints(right, [-600, 0]),
          addPoints(right, [-600, 400]),
          addPoints(right, [-400, 600]),
          addPoints(right, [0, 600]),
        ]))

        // blue spawn
        spawns.poly(pointsIsometric([
          left,
          addPoints(left, [0, -600]),
          addPoints(left, [400, -600]),
          addPoints(left, [600, -400]),
          addPoints(left, [600, 0]),
        ]))

        spawns.fill(0xaa00ff)

        r.c.addChild(grass, lanes, spawns)
      },
    })
  }
})
