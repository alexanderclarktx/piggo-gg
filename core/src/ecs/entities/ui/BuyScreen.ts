import { Action, Actions, Entity, Input, Position, Renderable } from "@piggo-gg/core";
import { Container, Graphics } from "pixi.js";

export const BuyScreen = (): Entity => {

  let visible = false;

  const container = new Container();
  const background = new Graphics();
  const outline = new Graphics();

  const buyScreen = Entity<Position | Renderable>({
    id: "buyScreen",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      input: Input({
        press: { "b": ({ world }) => ({ action: "toggleVisible", playerId: world.client?.playerId() }) }
      }),
      actions: Actions({
        toggleVisible: Action(() => {
          visible = !visible;
          buyScreen.components.renderable.visible = visible;
        })
      }),
      renderable: Renderable({
        zIndex: 11,
        visible: false,
        setContainer: async (r) => {
          const { width, height } = r.app.screen;

          background.rect(0, 0, width, height).fill({color: 0x000000, alpha: 0.3 });
          outline.roundRect(width / 6, height / 6, width / 1.5, height / 1.5).stroke({ color: 0xffffff, alpha: 1, width: 2 });

          container.addChild(background, outline);
          return container;
        }
      })
    }
  });

  return buyScreen;
}
