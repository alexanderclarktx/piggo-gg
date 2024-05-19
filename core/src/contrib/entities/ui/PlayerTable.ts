import { Actions, Debug, Entity, Input, Position, Renderable, ToggleHidden, ToggleVisible } from "@piggo-gg/core";
import { List } from "@pixi/ui";
import { Container, Graphics, Text } from "pixi.js";

export const PlayerTable = (): Entity => Entity({
  id: "player-table",
  components: {
    debug: new Debug(),
    input: new Input({
      press: {
        "tab": ({ world }) => ({ action: "ToggleVisible", playerId: world.client?.playerId })
      },
      release: {
        "tab": ({ world }) => ({ action: "ToggleHidden", playerId: world.client?.playerId })
      },
      joystick: () => null
    }),
    actions: new Actions({ ToggleVisible, ToggleHidden }),
    position: new Position({ x: 200, y: 200, screenFixed: true }),
    renderable: Table()
  }
});

export const Table = (): Renderable => {
  return new Renderable({
    visible: false,
    setup: async (r) => {
      const c = new List({
        type: "vertical",
        items
      });
      r.c.addChild(c);
    }
  })
}

const makeInnerContainer = (title: string, players: number): Container => {

  const box = (g: Graphics, outline: number): Graphics => {
    return g.clear().roundRect(2, 2, 196, 46, 0).fill({ color: 0x000000 }).stroke({ color: outline, width: 2 });
  }

  const c = new Container();
  const outline = box(new Graphics(), 0xffffff);

  const titleText = new Text({
    text: title,
    resolution: 2,
    anchor: { y: 0, x: 0.5 },
    position: { x: 100, y: 2 },
    style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff }
  });
  const subtitleText = new Text({
    text: `players: ${players}`,
    resolution: 2,
    anchor: { y: 0, x: 0.5 },
    position: { x: 100, y: 30 },
    style: { fontFamily: "Arial", fontSize: 12, fill: 0xffffff }
  });

  c.addChild(outline, titleText, subtitleText);

  c.onpointertap = () => {
    console.log(`pointertap ${title}`);
  }

  c.onmouseover = () => {
    box(outline, 0xffa0ab);
  }

  c.onmouseleave = () => {
    box(outline, 0xffffff);
  }

  return c;
}

let items: Container[] = [
  makeInnerContainer("panda", 21),
  makeInnerContainer("bear", 13),
  makeInnerContainer("apple", 6)
];
