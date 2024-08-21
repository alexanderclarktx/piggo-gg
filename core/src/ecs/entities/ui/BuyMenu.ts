import { Action, Actions, Entity, GunNames, Input, Position, Renderable, TwoPoints, WeaponTable, World, clickableClickedThisFrame, loadTexture, pixiGraphics, pixiText } from "@piggo-gg/core";
import { ScrollBox } from "@pixi/ui";
import { OutlineFilter } from "pixi-filters";
import { Container, Sprite } from "pixi.js";

export const BuyMenu = (): Entity => {

  let visible = false;

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
        setup: async (renderable, renderer, world) => {
          const { width, height } = renderer.app.screen;

          const background = pixiGraphics();
          const outline = pixiGraphics();

          // const coords: TwoPoints = [width / 6, height / 6, width / 1.5, height / 1.5]
          const coords: TwoPoints = [width / 6, height / 4, width / 1.5, height / 2]

          background.rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0.5 });
          outline.roundRect(...coords).stroke({ color: 0xffffff, alpha: 1, width: 2 });

          const deagle = await cell("Deagle", width, height, world);
          const ak = await cell("AK", width, height, world);
          const awp = await cell("AWP", width, height, world);

          const box = new ScrollBox({ width, height, type: "horizontal", elementsMargin: 20 });
          box.addItem(deagle, ak, awp);
          box.position.set(coords[0] + width / 16, coords[1] + height / 12);

          renderable.c.addChild(background, outline, box);
        }
      })
    }
  });

  return buyMenu;
}

const cell = async (text: string, width: number, height: number, world: World): Promise<Container> => {
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

  c.onpointerdown = () => {
    const playerCharacter = world.client?.playerCharacter();
    if (!playerCharacter) return;

    const newGun = WeaponTable[text.toLowerCase() as GunNames];
    if (!newGun) return;

    playerCharacter.components.gun = newGun();

    clickableClickedThisFrame.set(world.tick + 1);
  };
  c.onmouseenter = () => dark.visible = true;
  c.onmouseleave = () => dark.visible = false;

  return c;
}
