import { CraftSettings, Entity, HtmlDiv, NPC, Position } from "@piggo-gg/core"

export const Crosshair = () => {

  let init = false

  const div = HtmlDiv({
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "5px",
    height: "5px",
    backgroundColor: "rgba(0, 255, 255, 1)",
    border: "0px",
    borderRadius: "50%",
    pointerEvents: "none"
  })

  const crosshair = Entity({
    id: "crosshair",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          const settings = world.settings<CraftSettings>()
          if (!world.client || !world.three) return

          const locked = world.client.mobile ? !world.client.mobileMenu : document.pointerLockElement
          const item = world.client?.character()?.components.inventory?.activeItem(world)

          div.style.visibility = (locked && item && settings.showCrosshair) ? "visible" : "hidden"

          if (!init) {
            world.three?.append(div)
            init = true
          }
        }
      })
    }
  })

  return crosshair
}

export const Hitmarker = () => {
  let init = false

  const wrapper = HtmlDiv({
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)"
  })

  const marker = (left: `${number}px`, top: `${number}px`, rotate: number) => HtmlDiv({
    position: "absolute",
    left,
    top,
    width: "10px",
    height: "2px",
    border: "",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backgroundImage: "none",
    transform: `rotate(${rotate}deg)`
  })

  const topLeft = HtmlDiv({
    position: "absolute",
    left: "-14px",
    top: "-10px",
    width: "10px",
    height: "2px",
    border: "",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backgroundImage: "none",
    transform: "rotate(45deg)"
  })

  const topRight = HtmlDiv({
    position: "absolute",
    left: "4px",
    top: "-10px",
    width: "10px",
    height: "2px",
    border: "",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backgroundImage: "none",
    transform: "rotate(-45deg)"
  })

  wrapper.append(topLeft, topRight)

  const hitmarker = Entity({
    id: "hitmarker",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.client || !world.three) return

          const settings = world.settings<CraftSettings>()
          const locked = world.client.mobile ? !world.client.mobileMenu : document.pointerLockElement
          const item = world.client?.character()?.components.inventory?.activeItem(world)

          // wrapper.style.visibility = (locked && item && settings.showHitmarker) ? "visible" : "hidden"

          if (!init) {
            world.three?.append(wrapper)
            init = true
          }
        }
      })
    }
  })

  return hitmarker
}
