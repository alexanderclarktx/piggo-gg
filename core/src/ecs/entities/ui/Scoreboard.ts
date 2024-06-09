import { Actions, Entity, Input, Noob, Player, Position, Renderable, Team, TeamColors, ToggleHidden, ToggleVisible, World, pixiRect, pixiText, setsEqual } from "@piggo-gg/core";
import { ScrollBox } from "@pixi/ui";
import { Container, Graphics } from "pixi.js";

export const Scoreboard = (): Entity => {
  let players: Set<{name: string, entity: Noob}> = new Set();
  let team1: ScrollBox;
  let team2: ScrollBox;
  let width: number;

  const scoreboard = Entity<Position>({
    id: "scoreboard",
    components: {
      input: Input({
        press: {
          "shift": ({ world }) => ({ action: "ToggleVisible", playerId: world.client?.playerId })
        },
        release: {
          "shift": ({ world }) => ({ action: "ToggleHidden", playerId: world.client?.playerId })
        },
        joystick: () => null
      }),
      actions: Actions({ ToggleVisible, ToggleHidden }),
      position: Position({ x: 200, y: 200, screenFixed: true }),
      renderable: Renderable({
        visible: false,
        interactiveChildren: true,
        zIndex: 10,
        dynamic: (_, __, ___, w) => {
          const currentPlayerEntities = w.queryEntities(["player"]) as Noob[];
          const currentPlayers = new Set(currentPlayerEntities.map((p) => ({ name: p.id, entity: p })));

          // update player table
          if (!setsEqual(players, currentPlayers)) {
            players = currentPlayers;

            team1.removeItems();
            team2.removeItems();

            players.forEach((player) => {
              if (player.entity.components.team.data.team === 1) {
                team1.addItem(makeInnerContainer(player.entity, width, w));
              } else {
                team2.addItem(makeInnerContainer(player.entity, width, w));
              }
            });
          }
        },
        setup: async (r, renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          width = canvasWidth * 0.7;

          scoreboard.components.position.setPosition({ x: canvasWidth * 0.15, y: 100 });

          const rect = pixiRect({ w: width, h: 46 * 10, x: 0, y: 0, style: { color: 0xffffff, alpha: 0, strokeWidth: 2 } });

          team1 = new ScrollBox({ width: width, height: 201 });
          team2 = new ScrollBox({ width: width, height: 201 });
          team2.position.set(0, 46 * 5);

          r.c.addChild(team1, team2, rect);
        }
      })
    }
  });
  return scoreboard;
}

const makeInnerContainer = (entity: Entity<Team | Player>, width: number, world: World): Container => {
  const { team, player } = entity.components;

  const box = (g: Graphics): Graphics => {
    return g.clear().roundRect(2, 2, width - 4, 46, 0).fill({ color: team.data.team === 1 ? TeamColors[1] : TeamColors[2], alpha: 0.7 })
  }

  const c = new Container();

  const titleText = pixiText({
    text: player.name,
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

  const outline = box(new Graphics());

  c.addChild(outline, titleText, scorelineText);

  c.onpointerdown = () => {
    world.actionBuffer.push(world.tick + 2, player.name, { action: "switchTeam", playerId: world.client?.playerId });
  }

  return c;
}
