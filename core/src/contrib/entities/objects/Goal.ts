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
      e2.components.position.setPosition({ x: 370, y: 320 }).setVelocity({ x: 0, y: 0 });
    }
  }

  const render = async (): Promise<Container> => {
    const c = new Container();

    const g = new Graphics();

    // draw goal
    g.beginFill(color, 0.9);
    g.drawPolygon([
      -2, -width / 2,
      2, -width / 2,
      2, width / 2,
      -2, width / 2
    ])

    // goal count
    const t = new Text();
    t.setTransform(color % 2 === 0 ? -50 : 40, -10);
    t.style = { "fill": "yellow" };
    t.text = "0";

    // goal area
    c.addChild(g);
    c.addChild(t);

    return c;
  }

  return Entity({
    id: id ?? `goal1`,
    components: {
      networked: new Networked({ isNetworked: true }),
      data: new Data({ data: data }),
      position: new Position(position),
      collider: new Collider({
        shape: "cuboid",
        length: 1,
        width: width / 4 * 3,
        rotation: Math.PI * 3 / 4,
        sensor: sensor
      }),
      renderable: new Renderable({
        dynamic: (c) => {
          const t = c.children[1] as Text;
          if (t) t.text = `${data.goals}`
        },
        zIndex: 2,
        container: render
      })
    }
  })
}
