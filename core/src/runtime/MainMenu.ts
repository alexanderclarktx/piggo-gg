import { Entity, GameBuilder, Position, Renderable } from "@piggo-gg/core";
import { Container, Text } from "pixi.js";

export const LobbiesTable = (): Entity => Entity({
  id: "lobbies-table",
  components: {
    position: new Position({ x: 300, y: 300, screenFixed: true }),
    renderable: new Renderable({
      zIndex: 2,
      setContainer: async () => {
        const c = new Container();

        const title = new Text({ text: "Lobbies", style: { fontFamily: "Arial", fontSize: 24, fill: 0xff00ff } });
        c.addChild(title);

        return c;
      }
    })
  }
});

// TODO should this be a "scene" instead of a "game"
export const MainMenu: GameBuilder<"main-menu"> = ({

  id: "main-menu",
  init: () => ({
    id: "main-menu",
    entities: [
      LobbiesTable(),
    ],
    systems: [],
  })
})
