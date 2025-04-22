import { Collider, Data, Entity, Networked, Position, Renderable, World, XY, pixiText } from "@piggo-gg/core"
import { Container, Graphics, Text } from "pixi.js"

export type GoalProps = {
  position: XY
  length: number
  width: number
  id?: string
  color: number
}

export const Goal = ({ color, position, id, width }: GoalProps): Entity => {

  const data = {
    goals: 0,
    lastScored: 0
  }

  const sensor = (e2: Entity<Position>, world: World): boolean => {
    if (e2.id.startsWith("ball") && ((world.tick - data.lastScored) > 100)) {
      data.goals += 1
      data.lastScored = world.tick
      e2.components.position.setPosition({ x: 50, y: position.y }).setVelocity({ x: 0, y: 0 })
      return true
    }
    return false
  }

  const render = async (): Promise<Container> => {
    const c = new Container()
    const g = new Graphics()

    // draw goal
    g.poly([
      -2, -width,
      2, -width,
      2, width,
      -2, width
    ]).fill({ color, alpha: 0.9 })

    // goal count
    const t = pixiText({
      text: "0",
      style: { fill: 0xffff00 }
    }).updateTransform({ x: color % 2 === 0 ? -50 : 40, y: -10 })

    // goal area
    c.addChild(g, t)

    return c
  }

  return Entity({
    id: id ?? `goal1`,
    components: {
      networked: Networked(),
      data: Data({ data: data }),
      position: Position(position),
      collider: Collider({
        shape: "cuboid",
        length: 1,
        width: width,
        sensor: sensor
      }),
      renderable: Renderable({
        onTick:({ container }) => {
          const t = container.children[1] as Text
          if (t) t.text = `${data.goals}`
        },
        zIndex: 3,
        setContainer: render
      })
    }
  })
}
