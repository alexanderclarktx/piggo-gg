import { Debug, Entity, Position, Renderable, TeamColors, pixiText } from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export const ScorePanel = (): Entity => {

  let left = 0
  let right = 0

  const textLeft = pixiText({
    text: "0", pos: { x: -30, y: 16 }, anchor: { x: 0.5, y: 0 }, style: { fill: 0xffffff, fontSize: 24 }
  })

  const textRight = pixiText({
    text: "0", pos: { x: 30, y: 16 }, anchor: { x: 0.5, y: 0 }, style: { fill: 0xffffff, fontSize: 24 }
  })

  const scorePanel = Entity<Position>({
    id: "scorepanel",
    components: {
      position: Position({ screenFixed: true }),
      debug: Debug(),
      renderable: Renderable({
        zIndex: 10,
        anchor: { x: 0.5, y: 0 },
        dynamic: ({ world }) => {
          const state = world.game.state as { scoreLeft: number, scoreRight: number }
          if (left !== state.scoreLeft || right !== state.scoreRight) {
            left = state.scoreLeft
            right = state.scoreRight

            textLeft.text = left.toString()
            textRight.text = right.toString()
          }
        },
        setup: async (r, renderer) => {
          const g = new Graphics()
          g.roundRect(-55, 5, 50, 50, 10)
            .fill({ color: TeamColors[1], alpha: 0.7 })
            .stroke({ color: 0xffffff, width: 2, alpha: 0.9 })
            .roundRect(5, 5, 50, 50, 10)
            .fill({ color: TeamColors[2], alpha: 0.7 })
            .stroke({ color: 0xffffff, width: 2, alpha: 0.9 })

          r.c.addChild(g, textLeft, textRight)

          const { width } = renderer.props.canvas
          scorePanel.components.position.setPosition({ x: width / 2, y: 0 })
        }
      })
    }
  })

  return scorePanel
}
