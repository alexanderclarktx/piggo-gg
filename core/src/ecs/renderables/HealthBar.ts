import { Health, Renderable, RenderableProps } from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export type HealthBarProps = RenderableProps & {
  health: Health
}

// todo sometimes disappears
export const HealthBar = ({ health }: HealthBarProps): Renderable => {

  const g = new Graphics()
  let cachedHealthPercent = 1

  const draw = (g: Graphics) => {
    // gold outline
    g.setStrokeStyle({ width: 2, color: 0xffdd00, alpha: 1 })
    g.rect(-15, -30, 30, 4)
    g.stroke()

    // red length proportional to percent health
    const length = 28 * cachedHealthPercent
    g.rect(-14, -29, length, 2)
    g.fill({ color: 0xff0000, alpha: 1 })
  }

  const renderable = Renderable({
    zIndex: 10,
    interpolate: true,
    onTick: () => {
      const { hp, maxHp } = health.data

      const healthPercent = hp / maxHp
      if (hp / maxHp !== cachedHealthPercent) {
        cachedHealthPercent = healthPercent
        draw(g.clear())
      }
    },
    setup: async (r: Renderable) => {
      draw(g)
      r.c.addChild(g)
    }
  })

  return renderable
}
