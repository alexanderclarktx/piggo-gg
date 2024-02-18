import { Health, Renderable, RenderableProps } from "@piggo-legends/core";
import { Graphics, Container } from "pixi.js";

export type HealthBarProps = RenderableProps & {
  health: Health
}

// TODO container prop broken, have to use this.init
export const HealthBar = (health: Health): (r: Renderable) => Promise<void> => {

  const draw = (g: Graphics) => {
    // gold outline
    g.lineStyle(1, 0xffd700, 1);
    g.drawRect(-15, -35, 30, 5);

    // red length proportional to percent health
    const length = 30 * (health.data.health / health.data.maxHealth);
    g.beginFill(0xff0000, 0.9);
    g.drawRect(-15, -35, length, 5);
    g.endFill();
  }

  return async (r: Renderable) => {
    r.props.dynamic = (c: Container) => {
      const g = c.getChildAt(0) as Graphics;
      g.clear();
      draw(g);
    }

    const drawing = new Graphics();
    draw(drawing);
    r.c.addChild(drawing);
  }
}
