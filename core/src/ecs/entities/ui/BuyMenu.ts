import { Action, Actions, Entity, Input, Position, Renderable, TwoPoints, loadTexture, pixiGraphics, pixiText } from "@piggo-gg/core";
import { ScrollBox } from "@pixi/ui";
import { OutlineFilter } from "pixi-filters";
import { Container, Sprite } from "pixi.js";

export const BuyMenu = (): Entity => {

  let visible = false;

  const container = new Container();
  const background = pixiGraphics();
  const outline = pixiGraphics();

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

          // const coords: TwoPoints = [width / 6, height / 6, width / 1.5, height / 1.5]
          const coords: TwoPoints = [width / 6, height / 4, width / 1.5, height / 2]

          background.rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0.5 });
          outline.roundRect(...coords).stroke({ color: 0xffffff, alpha: 1, width: 2 });

          const deagle = await cell("Deagle", width, height);
          const ak = await cell("AK", width, height);
          const awp = await cell("AWP", width, height);

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

const cell = async (text: string, width: number, height: number): Promise<Container> => {
  const c = new Container();
  c.interactiveChildren = true;

  const coords: TwoPoints = [0, height / 24, width / 6, height / 4]

  const light = pixiGraphics().roundRect(...coords).fill({ color: 0xffffff, alpha: 0.2 })
  const dark = pixiGraphics({ visible: false }).roundRect(...coords).fill({ color: 0x000000, alpha: 0.5 });
  const outline = pixiGraphics().roundRect(...coords).stroke({ color: 0xffffff, alpha: 1, width: 2 });

  const textures = await loadTexture(`${text.toLowerCase()}.json`);
  const decal = new Sprite({
    texture: textures["0"],
    anchor: { x: 0.5, y: 0.5 },
    position: { x: width / 12, y: height / 6 },
    scale: 7,
  });
  decal.texture.source.scaleMode = "nearest";
  decal.filters = new OutlineFilter({ thickness: 2, color: 0xffffff, knockout: true });

  const name = pixiText({
    text,
    style: { fill: 0xffffff, fontSize: 20 },
    pos: { x: width / 12, y: height / 4 },
    anchor: { x: 0.5, y: 0.5 }
  });

  c.addChild(light, dark, outline, name, decal);

  c.onpointerdown = console.log;
  c.onmouseenter = () => dark.visible = true;
  c.onmouseleave = () => dark.visible = false;

  return c;
}
