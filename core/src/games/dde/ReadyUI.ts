import { Entity, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core"


export const ReadyUI = (): Entity => {

  let init = false
  let numPlayers = 0

  const container = HtmlDiv({
    top: "10px",
    right: "10px",
    // transform: "translate(-100%)",
    width: "200px",
    height: "100px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "10px",
    border: "2px solid #ffffff",
  })

  // const playerRow = HtmlDiv({
  //   position: "relative",
  //   display: "flex",
  //   width: "100%",
  //   marginTop: "10px",
  // })

  // const playerName = HtmlText({
  //   text: "noobaaa",
  //   style: {
  //     left: "10px"
  //   }
  // })

  // const playerReady = HtmlText({
  //   text: "🟢",
  //   style: {
  //     position: "absolute",
  //     right: "10px"
  //   }
  // })

  // playerRow.append(playerName)
  // playerRow.append(playerReady)

  // container.append(playerRow)

  // container.append(playerName)

  const ui = Entity({
    id: "ReadyUI",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!init) {
            init = true

            console.log("ReadyUI init")

            world.three?.append(container)
          }

          console.log("ReadyUI behavior", numPlayers, world.players().length)

          const players = world.players()
          if (numPlayers !== players.length) {
            numPlayers = players.length

            container.innerHTML = ""

            for (const player of players) {
              const { name, ready } = player.components.pc.data

              const playerRow = PlayerRow(name, ready)
              container.append(playerRow)
              console.log("Player row added:", name, ready)
            }
          }
        }
      })
    }
  })

  return ui
}

const PlayerRow = (playerName: string, ready: boolean): HTMLDivElement => {
  const row = HtmlDiv({
    position: "relative",
    display: "flex",
    width: "100%",
    marginTop: "10px",
  })

  const nameText = HtmlText({
    text: playerName,
    style: {
      left: "10px"
    }
  })

  const readyText = HtmlText({
    text: ready ? "🟢" : "🔴",
    style: {
      position: "absolute",
      right: "10px"
    }
  })

  row.append(nameText)
  row.append(readyText)

  return row
}
