import { Health, Renderable, RenderableProps } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type HealthBarProps = RenderableProps & {
  health: Health
}

export const HealthBar = ({ health }: HealthBarProps): Renderable => {

  const g = new Graphics();
  let cachedHealthPercent = 0;

  const draw = (g: Graphics) => {
    // gold outline
    g.setStrokeStyle({ width: 2, color: 0xffdd00, alpha: 1 });
    g.rect(-15, -30, 30, 4);
    g.stroke();

    // red length proportional to percent health
    const length = 28 * (health.data.health / health.data.maxHealth);
    g.rect(-14, -29, length, 2);
    g.fill({ color: 0xff0000, alpha: 1 });
  }

  const renderable = Renderable({
    zIndex: 10,
    interpolate: true,
    dynamic: () => {
      const healthPercent = health.data.health / health.data.maxHealth;
      if (healthPercent !== cachedHealthPercent) {
        draw(g.clear());
      }
    },
    setup: async (r: Renderable) => {
      draw(g);
      r.c.addChild(g);
    }
  });

  return renderable
}
