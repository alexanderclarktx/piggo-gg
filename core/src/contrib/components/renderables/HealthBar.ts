import { Health, Renderable, RenderableProps } from "@piggo-gg/core";
import { Graphics, Container } from "pixi.js";

export type HealthBarProps = RenderableProps & {
  health: Health
}

// TODO container prop broken, have to use this.init
export const HealthBar = (health: Health): (r: Renderable) => Promise<void> => {

  const draw = (g: Graphics) => {
    // gold outline
    g.setStrokeStyle({ width: 1, color: 0xffd700, alpha: 1 });
    g.rect(-15, -30, 30, 5);
    g.stroke();

    // red length proportional to percent health
    const length = 30 * (health.data.health / health.data.maxHealth);
    g.rect(-15, -30, length, 5);
    g.fill({ color: 0xff0000, alpha: 0.9 });
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
