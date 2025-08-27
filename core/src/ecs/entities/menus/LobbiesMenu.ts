import { entries, HtmlButton, HtmlDiv, HtmlText, keys, RefreshableDiv, styleButton, World } from "@piggo-gg/core"

export const LobbiesMenu = (world: World): RefreshableDiv => {

  let polled = -60
  let inLobby: string = ""

  const lobbies = HtmlDiv({
    top: "-3px",
    left: "50%",
    width: "100%",
    height: "100%",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "auto",
    borderRadius: "10px",
    position: "relative",
    display: "flex",
    flexDirection: "column"
  })

  const lobbyList = HtmlDiv({
    width: "94%",
    flex: "1 1 auto",
    left: "50%",
    top: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    border: "2px solid #bbbbbb",
    borderRadius: "10px",
    overflow: "scroll",
    transform: "translate(-50%)",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  })

  const buttonsDiv = HtmlDiv({
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    border: "",
    paddingBottom: "30px"
  })

  const createLobby = HtmlButton({
    text: "Create Lobby",
    style: {
      transform: "translate(0%, 50%)",
      position: "relative",
      left: "10px",
      height: "40px",
      width: "46%"
    },
    onClick: () => {
      if (inLobby) return

      world.client?.lobbyCreate(({ lobbyId }) => {
        inLobby = lobbyId
        polled = world.tick - 70
      })
    }
  })

  const leaveLobby = HtmlButton({
    text: "Leave Lobby",
    style: {
      transform: "translate(0%, 50%)",
      position: "relative",
      right: "10px",
      height: "40px",
      width: "46%"
    },
    onClick: () => {
      if (!inLobby) return

      world.client?.lobbyLeave()

      polled = world.tick - 70
      inLobby = ""
    }
  })

  lobbies.appendChild(lobbyList)
  lobbies.appendChild(buttonsDiv)
  buttonsDiv.appendChild(createLobby)
  buttonsDiv.appendChild(leaveLobby)

  return {
    div: lobbies,
    update: () => {

      styleButton(createLobby, Boolean(!inLobby && world.client?.net.connected), createLobby.matches(":hover"))
      styleButton(leaveLobby, Boolean(inLobby), leaveLobby.matches(":hover"))

      if (world.tick - 80 > polled) {
        polled = world.tick
        world.client?.lobbyList((response) => {
          lobbyList.innerHTML = ""

          for (const [id, meta] of entries(response.lobbies)) {
            const lobby = HtmlText({
              text: `(${meta.players}) [${id}] ${meta.creator}`,
              style: {
                width: "75%",
                height: "36px",
                left: "5px",
                fontSize: "16px",
                lineHeight: "36px",
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: meta.id === inLobby ? "2px solid #aaffaa" : "2px solid #aaffff",
                borderRadius: "8px"
              }
            })

            const button = HtmlButton({
              text: "Join",
              onHover: () => {
                button.style.backgroundColor = "rgba(0, 160, 255, 0.4)"
              },
              onHoverOut: () => {
                button.style.backgroundColor = "rgba(0, 0, 0, 0.4)"
              },
              onClick: () => {
                world.client?.lobbyJoin(meta.id, () => {
                  inLobby = meta.id
                  polled = world.tick - 70
                })
              },
              style: {
                width: "20%",
                height: "40px",
                fontSize: "16px",
                right: "5px",
                border: meta.id === inLobby ? "2px solid #bbbbbb" : "2px solid #ffffff",
                color: meta.id === inLobby ? "#bbbbbb" : "#ffffff",
                backgroundColor: meta.id === inLobby ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.4)",
                pointerEvents: meta.id === inLobby ? "none" : "auto",
                position: "relative",
                float: "right"
              }
            })

            const lobbyWrapper = HtmlDiv({
              position: "relative",
              marginTop: "5px",
              border: ""
            })

            lobbyWrapper.appendChild(lobby)
            lobbyWrapper.appendChild(button)

            lobbyList.appendChild(lobbyWrapper)
          }

          if (keys(response.lobbies).length === 0) {
            inLobby = ""
          }
        })
      }
    }
  }
}
