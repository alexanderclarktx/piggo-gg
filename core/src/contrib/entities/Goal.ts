import { Collider, Data, Entity, Networked, Position, Renderable, World } from "@piggo-legends/core";
import { Container, Graphics } from "pixi.js";

export type GoalProps = {
  position: { x: number, y: number }
  length: number
  width: number
  id?: string
  color: number
}

export const Goal = ({ color, position, id, width, length }: GoalProps): Entity => {

  const data = {
    goals: 0,
    lastScored: 0
  }

  const sensor = (e2: Entity<Position>, world: World) => {
    if (e2.id.startsWith("ball") && ((world.tick - data.lastScored) > 100)) {
      data.goals += 1;
      data.lastScored = world.tick;
      console.log("GOAL", data.goals);
    }
  }

  const render = async (): Promise<Container> => {
    const g = new Graphics();
    g.beginFill(color, 0.9);
    g.drawPolygon([
      width, -width / 2 - 2,
      width, -width / 2 + 2,
      -width, width / 2 + 2,
      -width, width / 2 - 2
    ])
    g.endFill();
    const c = new Container()
    c.addChild(g);
    return c;
  }

  return {
    id: id ?? `goal1`,
    components: {
      networked: new Networked({ isNetworked: true }),
      data: new Data({ data: data }),
      position: new Position(position),
      collider: new Collider({
        length,
        width,
        sensor: sensor
      }),
      renderable: new Renderable({
        zIndex: 3,
        container: render
      })
    }
  }
}
