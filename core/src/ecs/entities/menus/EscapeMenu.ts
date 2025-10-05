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
  let rotation = 0

  art.onclick = () => {
    rotation += 540
    art.style.transform = `translate(-50%) rotateY(${rotation}deg)`
  }

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
      // world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: "lobby" } })
      world.actions.push(world.tick + 10, "world", { actionId: "game", params: { game: "lobby" } })
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
  if (!world.client?.mobile) ddeMenu.appendChild(returnToHomescreen)
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
            const visible = world.client.mobileMenu
            ddeMenu.style.visibility = visible ? "visible" : "hidden"

            if (!visible) return
          }

          art.style.width = (world.client?.mobile && window.outerHeight < window.outerWidth) ? "0px" : "180px"

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
  transition: "transform 1.2s ease",
  position: "relative",

  border: "3px solid transparent",
  padding: "0px",
  backgroundImage: "linear-gradient(black, black), linear-gradient(180deg, white, 90%, #999999)",
  backgroundOrigin: "border-box",
  backgroundClip: "content-box, border-box",
  pointerEvents: "auto"
})
