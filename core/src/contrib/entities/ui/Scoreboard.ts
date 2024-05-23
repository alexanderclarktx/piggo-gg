import { Actions, Debug, Entity, Input, Position, Renderable, ToggleHidden, ToggleVisible, pixiText, setsEqual } from "@piggo-gg/core";
import { List, ScrollBox } from "@pixi/ui";
import { Container, Graphics } from "pixi.js";

export const Scoreboard = (): Entity => {
  let players: Set<string> = new Set();

  const scoreboard = Entity<Position>({
    id: "scoreboard",
    components: {
      debug: new Debug(),
      input: new Input({
        press: {
          "shift": ({ world }) => ({ action: "ToggleVisible", playerId: world.client?.playerId })
        },
        release: {
          "shift": ({ world }) => ({ action: "ToggleHidden", playerId: world.client?.playerId })
        },
        joystick: () => null
      }),
      actions: new Actions({ ToggleVisible, ToggleHidden }),
      position: new Position({ x: 200, y: 200, screenFixed: true }),
      renderable: new Renderable({
        visible: false,
        interactiveChildren: true,
        zIndex: 10,
        dynamic: (c: ScrollBox, _, __, w) => {
          const currentPlayerEntities = w.queryEntities(["player"]);
          let currentPlayers = new Set(currentPlayerEntities.map((p) => p.id));

          // update player table
          if (!setsEqual(players, currentPlayers)) {
            players = currentPlayers;

            c.removeItems();

            const width = w.renderer!.props.canvas.width * 0.7;

            players.forEach((player) => {
              c.addItem(makeInnerContainer(player, width, 0));
            });
          }
        },
        setup: async (r, renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          const width = canvasWidth * 0.7;
          scoreboard.components.position.setPosition({ x: canvasWidth * 0.15, y: 150 });

          r.c = new ScrollBox({
            width: width,
            height: 201,
          });
        }
      })
    }
  });
  return scoreboard;
}

const makeInnerContainer = (title: string, width: number, team: number): Container => {

  const box = (g: Graphics, outline: number): Graphics => {
    return g.clear().roundRect(2, 2, width - 4, 46, 0).fill({ color: 0x000000, alpha: 0.7 }).stroke({ color: outline, width: 2 });
  }

  const c = new Container();

  const titleText = pixiText({
    text: title,
    style: { fill: 0xffffff, fontSize: 24 },
    pos: { x: 20, y: 10 },
    anchor: { x: 0, y: 0 }
  })

  const scorelineText = pixiText({
    text: `0/0/0`,
    style: { fill: 0xffffff, fontSize: 24 },
    pos: { x: width / 2, y: 10 },
    anchor: { x: 0.5, y: 0 }
  })

  const outline = box(new Graphics(), 0xffffff);

  c.addChild(outline, titleText, scorelineText);

  c.onpointertap = () => {
    console.log(`pointertap ${title}`);
  }

  c.onpointerover = () => {
    console.log("hover");
    box(outline, 0xffa0ab);
  }

  c.onmouseleave = () => {
    box(outline, 0xffffff);
  }

  return c;
}
