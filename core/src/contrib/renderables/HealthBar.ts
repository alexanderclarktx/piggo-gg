import { Health, Renderable, RenderableProps } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type HealthBarProps = RenderableProps & {
  health: Health
}

// TODO redrawing on every tick
export const HealthBar = ({ health }: HealthBarProps): Renderable => {

  const g = new Graphics();

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

  const renderable = new Renderable({
    zIndex: 10,
    dynamic: () => {
      g.clear();
      draw(g);
    },
    setup: async (r: Renderable) => {
      draw(g);
      r.c.addChild(g);
    }
  });

  return renderable
}
