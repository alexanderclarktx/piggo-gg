import {
  Actions, Entity, Input, Player, Position, Renderable, TeamColors, ToggleHidden,
  ToggleVisible, World, clickableClickedThisFrame, pixiRect, pixiText, setsEqual
} from "@piggo-gg/core"
import { ScrollBox } from "@pixi/ui"
import { Container, Graphics } from "pixi.js"

export const Scoreboard = (): Entity => {
  let players: Set<{ name: string, entity: Player }> = new Set()
  let team1: ScrollBox
  let team2: ScrollBox
  let width: number

  const scoreboard = Entity<Position>({
    id: "scoreboard",
    components: {
      position: Position({ x: 200, y: 200, screenFixed: true }),
      input: Input({
        press: { "shift": ({ world }) => ({ actionId: "ToggleVisible", playerId: world.client?.playerId() }) },
        release: { "shift": ({ world }) => ({ actionId: "ToggleHidden", playerId: world.client?.playerId() }) }
      }),
      actions: Actions({ ToggleVisible, ToggleHidden }),
      renderable: Renderable({
        visible: false,
        interactiveChildren: true,
        zIndex: 10,
        dynamic: ({ world }) => {
          const currentPlayerEntities = world.queryEntities(["pc"]) as Player[]
          const currentPlayers = new Set(currentPlayerEntities.map((p) => ({ name: p.id, entity: p })))

          // update player table
          if (!setsEqual(players, currentPlayers)) {
            players = currentPlayers

            team1.removeItems()
            team2.removeItems()

            players.forEach((player) => {
              if (player.entity.components.team.data.team === 1) {
                team1.addItem(playerRow(player.entity, width, world))
              } else {
                team2.addItem(playerRow(player.entity, width, world))
              }
            })
          }
        },
        setup: async (r, renderer) => {
          const canvasWidth = renderer.props.canvas.width
          width = canvasWidth * 0.7

          scoreboard.components.position.setPosition({ x: canvasWidth * 0.15, y: 100 })

          const rect = pixiRect({ w: width, h: 46 * 10, x: 0, y: 0, style: { color: 0xffffff, alpha: 0, strokeWidth: 2 } })

          team1 = new ScrollBox({ width: width, height: 201 })
          team2 = new ScrollBox({ width: width, height: 201 })
          team2.position.set(0, 46 * 5)

          r.c.addChild(team1, team2, rect)
        }
      })
    }
  })
  return scoreboard
}

const playerRow = (entity: Player, width: number, world: World): Container => {
  const { team, pc } = entity.components

  const box = (g: Graphics): Graphics => {
    return g.clear().roundRect(2, 2, width - 4, 46, 0).fill({ color: team.data.team === 1 ? TeamColors[1] : TeamColors[2], alpha: 0.7 })
  }

  const c = new Container()

  const titleText = pixiText({
    text: pc.data.name,
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

  const moneyText = pixiText({
    text: `$${entity.components.money?.data.balance ?? 0}`,
    style: { fill: 0xffffff, fontSize: 24 },
    pos: { x: width / 1.2, y: 10 },
    anchor: { x: 1, y: 0 }
  })

  const outline = box(new Graphics())

  c.addChild(outline, titleText, scorelineText, moneyText)

  c.onpointerdown = () => {
    clickableClickedThisFrame.set(world.tick + 1)
    world.actions.push(world.tick + 2, pc.data.name, { actionId: "switchTeam", playerId: world.client?.playerId() })
  }

  return c
}
