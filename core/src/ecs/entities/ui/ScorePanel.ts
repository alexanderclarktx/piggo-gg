import { Debug, Entity, Position, Renderable, TeamColors, pixiText } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export const ScorePanel = (): Entity => {
  const scorePanel = Entity<Position>({
    id: "scorepanel",
    components: {
      position: new Position({ screenFixed: true }),
      debug: new Debug(),
      renderable: new Renderable({
        zIndex: 10,
        anchor: { x: 0.5, y: 0 },
        setup: async (r, renderer) => {
          const g = new Graphics();
          g.roundRect(-55, 5, 50, 50, 10)
            .fill({ color: TeamColors[1], alpha: 0.7 })
            .stroke({ color: 0xffffff, width: 2, alpha: 0.7 })
            .roundRect(5, 5, 50, 50, 10)
            .fill({ color: TeamColors[2], alpha: 0.7 })
            .stroke({ color: 0xffffff, width: 2, alpha: 0.7 });

          const text1 = pixiText({ text: "0", pos: { x: -30, y: 16 }, anchor: { x: 0.5, y: 0 }, style: { fill: 0xffffff, fontSize: 24 } });
          const text2 = pixiText({ text: "0", pos: { x: 30, y: 16 }, anchor: { x: 0.5, y: 0 }, style: { fill: 0xffffff, fontSize: 24 } });

          r.c.addChild(g, text1, text2);

          const { width } = renderer.props.canvas;
          scorePanel.components.position.setPosition({ x: width / 2, y: 0 });
        }
      })
    }
  })

  return scorePanel;
}