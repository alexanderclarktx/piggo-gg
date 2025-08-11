import { Entity, HtmlDiv, HtmlText, NPC, Player, Position, RefreshableDiv } from "@piggo-gg/core"

export const ReadyUI = (): Entity => {

  let init = false
  let numPlayers = 0
  const playerRows: Record<string, RefreshableDiv> = {}

  const container = HtmlDiv({
    top: "10px",
    right: "10px",
    width: "200px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "10px",
    border: "2px solid #ffffff",
  })

  const ui = Entity({
    id: "ReadyUI",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (world.mode === "server") return

          if (!init) {
            init = true
            world.three?.append(container)
          }

          const players = world.players()
          if (numPlayers !== players.length) {
            numPlayers = players.length

            container.innerHTML = ""

            for (const player of players) {
              const playerRow = PlayerRow(player)

              container.append(playerRow.div)

              playerRows[player.id] = playerRow
            }
          }

          for (const player of players) {
            playerRows[player.id]?.update()
          }
        }
      })
    }
  })

  return ui
}

const PlayerRow = (player: Player): RefreshableDiv => {
  const div = HtmlDiv({
    position: "relative",
    marginTop: "10px",
    height: "30px",
  })

  const nameText = HtmlText({
    text: player.components.pc.data.name,
    style: {
      width: "160px",
      display: "flex",
      justifyContent: "center",
      left: "10px",
      fontSize: "18px",
    }
  })

  const readyText = HtmlText({
    text: player.components.pc.data.ready ? "🟢" : "🔴",
    style: {
      right: "10px",
      fontSize: "18px",
    }
  })

  div.append(nameText)
  div.append(readyText)

  return {
    div,
    update: () => {
      nameText.textContent = player.components.pc.data.name
      readyText.textContent = player.components.pc.data.ready ? "🟢" : "🔴"
    }
  }
}
