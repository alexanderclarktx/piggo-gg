import { Debug, Entity, GameBuilder, Position, Renderable } from "@piggo-gg/core";
import { ScrollBox } from "@pixi/ui";
import { Container, Graphics, Text } from "pixi.js";

// TODO should this be a "scene" instead of a "game"
export const Menu: GameBuilder<"menu"> = ({

  id: "menu",
  init: () => ({
    id: "menu",
    entities: [
      // Singleplayer(),
      // Createlobby(),
      // JoinLobby(),
      LobbiesTable(),
      // DebugButton()
    ],
    systems: [],
  })
})

export const JoinLobby = (): Entity => {
  const s = Entity<Position>({
    id: "joinlobby",
    components: {
      position: new Position({ x: 0, y: 0, screenFixed: true }),
      renderable: new Renderable({
        setContainer: async (renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          s.components.position.setPosition({ x: canvasWidth / 2, y: 230 })

          const c = new Container();
          const title = new Text({ text: "Lobbies:", anchor: 0.5, resolution: 2, style: { fontFamily: "Arial", fontSize: 16, fill: 0xffffff } });
          c.addChild(title);
          return c;
        }
      })
    }
  });
  return s;
}

export const Createlobby = (): Entity => {
  const s = Entity<Position>({
    id: "createlobby",
    components: {
      position: new Position({ x: 0, y: 0, screenFixed: true }),
      renderable: new Renderable({
        setContainer: async (renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          s.components.position.setPosition({ x: canvasWidth / 2, y: 150 })

          const c = new Container();
          const title = new Text({ text: "Create Lobby", anchor: 0.5, resolution: 2, style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff } });
          c.addChild(title);
          return c;
        }
      })
    }
  });
  return s;
}

const menuItemText = (text: string): Container => {
  const c = new Container();
  const t = new Text({ text, anchor: 0.5, resolution: 2, style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff } });
  t.onpointerover = () => {
    t.style.fill = 0xffa0ab;
    t.updateTransform({});
    console.log("mouseover");
  }
  t.onpointerout = () => {
    t.style.fill = 0xffffff;
  }

  c.addChild(t);

  return c;
}

export const Singleplayer = (): Entity => {
  const s = Entity<Position>({
    id: "singleplayer",
    components: {
      position: new Position({ x: 0, y: 0, screenFixed: true }),
      renderable: new Renderable({
        interactiveChildren: true,
        setContainer: async (renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          s.components.position.setPosition({ x: canvasWidth / 2, y: 100 })

          return menuItemText("Singleplayer");
        }
      })
    }
  });

  return s;
}

export const LobbiesTable = (): Entity => {

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

  let lobbies: Record<string, number> = {};
  let items: Container[] = [
    makeInnerContainer("panda", 21),
    makeInnerContainer("bear", 13),
    makeInnerContainer("apple", 6),
    makeInnerContainer("orange", 18),
    makeInnerContainer("squadron", 4),
    makeInnerContainer("red", 5),
    makeInnerContainer("purple", 4),
    makeInnerContainer("zebra", 20),
    makeInnerContainer("washington", 54),
    makeInnerContainer("octopus", 19),
  ];

  const t = Entity<Position>({
    id: "lobbies-table",
    components: {
      position: new Position({ screenFixed: true }),
      debug: new Debug(),
      renderable: new Renderable({
        zIndex: 2,
        interactiveChildren: true,
        dynamic: async (c) => {
          // items.concat([
          //   new Graphics().rect(0, 0, 200, 50).fill(0x00ff00),
          // ])
        },
        setContainer: async (renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          t.components.position.setPosition({ x: canvasWidth / 2 - 100, y: 250 })

          // const c = new Container();
          const c = new ScrollBox({
            width: 200,
            height: 201,
            // background: 0xffffff,
            background: 0x000000,
            // background: {r: 255, g: 255, b: 255, a: 0.5},
            items,
            globalScroll: false,
            elementsMargin: 2
          });
          // const title = new Text({ text: "Lobbies", style: { fontFamily: "Arial", fontSize: 24, fill: 0xff00ff } });
          // c.addChild(title);
          return c;
        }
      })
    }
  });

  return t;
}
