import { Health, Renderable, RenderableProps } from "@piggo-legends/core";
import { Graphics, Container } from "pixi.js";

export type HealthBarProps = RenderableProps & {
  health: Health
}

// TODO container prop broken, have to use this.init
export class HealthBar extends Renderable {

  health: Health;

  constructor(props: HealthBarProps) {
    super({
      ...props,
      zIndex: 10,
      dynamic: (c: Container) => {
        const g = c.getChildAt(0) as Graphics;
        g.clear();
        this.draw(g);
      }
    });
    this.health = props.health;
    this.init();
  }

  draw = (g: Graphics) => {
    // gold outline
    g.lineStyle(1, 0xffd700, 1);
    g.drawRect(-15, -35, 30, 5);

    // red length proportional to percent health
    const length = 30 * (this.health.data.health / this.health.data.maxHealth);
    g.beginFill(0xff0000, 0.9);
    g.drawRect(-15, -35, length, 5);
    g.endFill();
  }

  init = () => {
    const drawing = new Graphics();
    this.draw(drawing);
    this.c.addChild(drawing);
  }
}
