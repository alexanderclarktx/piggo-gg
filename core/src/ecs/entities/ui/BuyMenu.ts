import { Action, Actions, Entity, Input, Position, Renderable, TwoPoints, pixiText } from "@piggo-gg/core";
import { ScrollBox } from "@pixi/ui";
import { Container, Graphics } from "pixi.js";

export const BuyMenu = (): Entity => {

  let visible = false;

  const container = new Container();
  const background = new Graphics();
  const outline = new Graphics();

  const buyMenu = Entity<Position | Renderable>({
    id: "buyMenu",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      input: Input({
        press: { "b": ({ world }) => ({ action: "toggleVisible", playerId: world.client?.playerId() }) }
      }),
      actions: Actions({
        toggleVisible: Action(() => {
          visible = !visible;
          buyMenu.components.renderable.visible = visible;
        })
      }),
      renderable: Renderable({
        zIndex: 11,
        visible: false,
        interactiveChildren: true,
        setup: async (renderable, renderer) => {
          const { width, height } = renderer.app.screen;

          const coords: TwoPoints = [width / 6, height / 6, width / 1.5, height / 1.5]

          background.rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0.5 });
          outline.roundRect(...coords).stroke({ color: 0xffffff, alpha: 1, width: 2 });

          const deagle = cell("Deagle", width, height);
          const ak = cell("AK", width, height);
          const awp = cell("AWP", width, height);

          const box = new ScrollBox({ width, height, type: "horizontal", elementsMargin: 20 });
          box.addItem(deagle, ak, awp);
          box.position.set(coords[0] + width / 16, coords[1] + height / 12);

          container.addChild(background, outline, box);
          container.interactive = true;
          container.interactiveChildren = true;

          renderable.c.addChild(container);
        }
      })
    }
  });

  return buyMenu;
}

const cell = (text: string, width: number, height: number): Container => {
  const c = new Container();
  c.interactiveChildren = true;

  const coords: TwoPoints = [0, 0, width / 6, height / 2]

  const light = new Graphics()
    .roundRect(...coords)
    .fill({ color: 0xffffff, alpha: 0.2 })

  const dark = new Graphics({ visible: false })
    .roundRect(...coords)
    .fill({ color: 0x000000, alpha: 0.5 });

  const outline = new Graphics()
    .roundRect(...coords)
    .stroke({ color: 0xffffff, alpha: 1, width: 2 });

  const name = pixiText({
    text,
    style: { fill: 0xffffff, fontSize: 20 },
    pos: { x: width / 12, y: 50 },
    anchor: { x: 0.5, y: 0.5 }
  });

  c.addChild(light, dark, outline, name);

  c.onpointerdown = () => {
    console.log("clicked");
  }

  c.onmouseenter = () => dark.visible = true;
  c.onmouseleave = () => dark.visible = false;

  return c;
}
