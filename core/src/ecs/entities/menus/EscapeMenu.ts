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
    display: "block",
    width: "404px",
    maxWidth: "94%",
    maxHeight: "98%",
    pointerEvents: "none",
    border: ""
  })

  const art = Art()

  const menuButtonStyle: CSS = {
    width: "32.5%", position: "relative", top: "-10px", height: "40px", pointerEvents: "auto"
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
    // top: "10px",
    
    width: "100%",
    // width: "404px",
    display: "flex",
    justifyContent: "space-between",
    border: ""
  })

  submenuButtons.appendChild(lobbiesButton)
  submenuButtons.appendChild(skinsButton)
  submenuButtons.appendChild(settingsButton)

  const lobbies = LobbiesMenu(world)
  const skins = SkinsMenu()
  const settings = SettingsMenu(world)

  ddeMenu.appendChild(art)
  ddeMenu.appendChild(submenuButtons)
  ddeMenu.appendChild(lobbies.div)
  ddeMenu.appendChild(skins.div)
  ddeMenu.appendChild(settings.div)

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
            const hidden = world.client.mobile ? world.three!.mobileLock : Boolean(document.pointerLockElement)
            ddeMenu.style.visibility = hidden ? "hidden" : "visible"

            if (hidden) return
          }

          if (world.client?.mobile && window.outerHeight < window.outerWidth) {
            // art.style.visibility = "hidden"
            art.style.width = "0px"
            art.style.border = "none"
          } else {
            art.style.width = "180px"
            art.style.border = "2px solid white"
            // art.style.visibility = "inherit"
          }

          // menu buttons
          styleButton(lobbiesButton, activeMenu !== "lobbies", lobbiesButton.matches(":hover"))
          styleButton(skinsButton, activeMenu !== "skins", skinsButton.matches(":hover"))
          styleButton(settingsButton, activeMenu !== "settings", settingsButton.matches(":hover"))

          // visibility of submenus
          lobbies.div.style.display = activeMenu === "lobbies" ? "block" : "none"
          skins.div.style.display = activeMenu === "skins" ? "block" : "none"
          settings.div.style.display = activeMenu === "settings" ? "block" : "none"

          lobbies.update()
          skins.update()
          settings.update()
        }
      })
    }
  })
  return menu
}

const Art = () => HtmlImg("dde-256.jpg", {
  top: "-15px",
  left: "50%",
  width: "180px",
  transform: "translate(-50%)",
  border: "2px solid #eeeeee",
  borderRadius: "10px",
  position: "relative"
})
