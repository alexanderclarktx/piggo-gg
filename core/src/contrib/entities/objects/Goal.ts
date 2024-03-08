import { Collider, Data, Entity, Networked, Position, Renderable, World } from "@piggo-gg/core";
import { Container, Graphics, Text } from "pixi.js";

export type GoalProps = {
  position: { x: number, y: number }
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

  const sensor = (e2: Entity<Position>, world: World) => {
    if (e2.id.startsWith("ball") && ((world.tick - data.lastScored) > 100)) {
      data.goals += 1;
      data.lastScored = world.tick;
      e2.components.position.setPosition({ x: 350, y: 350 })
    }
  }

  const render = async (): Promise<Container> => {
    const g = new Graphics();
    g.beginFill(color, 0.9);
    g.drawPolygon([
      -2, -width / 2,
      2, -width / 2,
      2, width / 2,
      -2, width / 2
    ])
    g.endFill();

    // goal count
    const t = new Text();
    t.setTransform(-7, width / 2);
    t.style = { "fill": "white" };
    t.text = "0";

    // goal area
    const c = new Container();
    c.addChild(g);
    c.addChild(t);

    return c;
  }

  return {
    id: id ?? `goal1`,
    components: {
      networked: new Networked({ isNetworked: true }),
      data: new Data({ data: data }),
      position: new Position(position),
      collider: new Collider({
        shape: "cuboid",
        length: 2,
        width: width / 4 * 3,
        rotation: Math.PI * 3 / 4,
        sensor: sensor
      }),
      renderable: new Renderable({
        dynamic: (c) => {
          const t = c.children[1] as Text;
          t.text = `${data.goals}`
        },
        zIndex: 2,
        container: render
      })
    }
  }
}
