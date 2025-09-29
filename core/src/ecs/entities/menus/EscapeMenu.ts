import {
  CSS, Entity, HtmlButton, HtmlDiv, HtmlImg, LobbiesMenu,
  NPC, Position, SettingsMenu, SkinsMenu, World, styleButton
} from "@piggo-gg/core"

export const EscapeMenu = (world: World): Entity => {

  let init = false
  let activeMenu: "lobbies" | "skins" | "settings" = "lobbies"

  const ddeMenu = HtmlDiv({
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "404px",
    maxWidth: "94%",
    height: "80%",
    maxHeight: "540px",
    pointerEvents: "none",
    border: "",
    display: "flex",
    flexDirection: "column",
    touchAction: "pan-y",
    visibility: "hidden"
  })

  const art = Art(world.game.id)

  const menuButtonStyle: CSS = {
    width: "32.5%", position: "relative", top: "0px", height: "40px", pointerEvents: "auto"
  }

  const lobbiesButton = HtmlButton({
    text: "lobbies",
    style: menuButtonStyle,
    onClick: () => activeMenu = "lobbies"
  })

  const skinsButton = HtmlButton({
    text: "skins",
    style: menuButtonStyle,
    onClick: () => activeMenu = "skins"
  })

  const settingsButton = HtmlButton({
    text: "settings",
    style: menuButtonStyle,
    onClick: () => activeMenu = "settings"
  })

  const submenuButtons = HtmlDiv({
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    border: ""
  })

  const returnToHomescreen = HtmlButton({
    text: "return to homescreen",
    style: {
      position: "relative",
      transform: "translate(-50%)",
      width: "260px",
      left: "50%",
      marginBottom: "10px",
      height: "40px",
      pointerEvents: "auto",
      fontSize: "18px",
    },
    onClick: () => {
      world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: "lobby" } })
      // world.actions.push(world.tick + 2, "world", { actionId: "game", params: { game: "lobby" } })
    }
  })

  submenuButtons.appendChild(lobbiesButton)
  submenuButtons.appendChild(skinsButton)
  submenuButtons.appendChild(settingsButton)

  const lobbies = LobbiesMenu(world)
  const skins = SkinsMenu()
  const settings = SettingsMenu(world)

  const shell = HtmlDiv({
    width: "100%",
    top: "10px",
    flex: "1 1 auto",
    maxHeight: "300px",
    minHeight: 0,
    display: "flex",
    border: "none",
    position: "relative",
    flexDirection: "column",
    touchAction: "pan-y"
  })

  shell.appendChild(lobbies.div)
  shell.appendChild(skins.div)
  shell.appendChild(settings.div)

  ddeMenu.appendChild(art)
  ddeMenu.appendChild(returnToHomescreen)
  ddeMenu.appendChild(submenuButtons)
  ddeMenu.appendChild(shell)

  const menu = Entity({
    id: "EscapeMenu",
    components: {
      position: Position({ x: 0, y: 0, z: 0 }),
      npc: NPC({
        behavior: (_, world) => {
          if (world.mode === "server") return

          if (!init) {
            world.three?.append(ddeMenu)
            init = true
          }

          // overall visibility
          if (world.client) {
            const visible = world.client.mobileMenu || !Boolean(document.pointerLockElement)
            ddeMenu.style.visibility = visible ? "visible" : "hidden"

            console.log("visible", !visible, "mobileMenu", world.client.mobileMenu, "pointerLockElement", document.pointerLockElement)

            if (!visible) return
          }

          if (world.client?.mobile && window.outerHeight < window.outerWidth) {
            art.style.width = "0px"
            art.style.border = "none"
          } else {
            art.style.width = "180px"
            art.style.border = "2px solid white"
          }

          // menu buttons
          styleButton(returnToHomescreen, true, returnToHomescreen.matches(":hover"))
          styleButton(lobbiesButton, activeMenu !== "lobbies", lobbiesButton.matches(":hover"))
          styleButton(skinsButton, activeMenu !== "skins", skinsButton.matches(":hover"))
          styleButton(settingsButton, activeMenu !== "settings", settingsButton.matches(":hover"))

          // visibility of submenus
          lobbies.div.style.display = activeMenu === "lobbies" ? "flex" : "none"
          skins.div.style.display = activeMenu === "skins" ? "flex" : "none"
          settings.div.style.display = activeMenu === "settings" ? "flex" : "none"

          lobbies.update()
          skins.update()
          settings.update()
        }
      })
    }
  })
  return menu
}

const Art = (gameId: string) => HtmlImg(`${gameId}-256.jpg`, {
  top: "-15px",
  left: "50%",
  width: "170px",
  transform: "translate(-50%)",
  border: "2px solid #eeeeee",
  position: "relative"
})
