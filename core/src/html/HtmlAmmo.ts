import { Entity, HDiv, HText, NPC, Position } from "@piggo-gg/core"

export const HtmlAmmo = (): Entity => {
  let init = false

  const wrapper = HDiv({
    style: {
      width: "fit-content",
      height: "36px",
      right: "15px",
      bottom: "15px",
      flexDirection: "row",
      display: "flex",
      alignItems: "center"
    }
  })

  return Entity({
    id: "htmlAmmo",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!init) {
            document.body.appendChild(wrapper)
            init = true
          }

          const pc = world.client?.character()
          const activeItem = pc?.components.inventory?.activeItem(world)
          const ammo = activeItem?.components.gun?.data.ammo
          if (!ammo) {
            wrapper.style.display = "none"
            return
          }

          // const total = ammo.reserve + (ammo.clip || 0)
          // const clip = ammo.clip || 0

          const clipText = HText({
            text: `${ammo} / 0`,
            style: {
              fontSize: "32px",
              color: "white",
              fontWeight: "bold",
              lineHeight: "36px",
              textAlign: "right",
              width: "fit-content",
              height: "36px",
              marginRight: "4px"
            }
          })

          // const slashText = HText({
          //   innerText: "/",
          //   style: {
          //     fontSize: "32px",
          //     color: "white",
          //     textShadow: "0 0 6px black",
          //     fontFamily: "Arial, sans-serif",
          //     fontWeight: "bold",
          //     lineHeight: "36px",
          //     textAlign: "right",
          //     width: "fit-content",
          //     height: "36px",
          //     marginRight: "4px"
          //   }
          // })

          // const totalText = HText({
          //   innerText: `${total}`,
          //   style: {
          //     fontSize: "32px",
          //     color: total <= 0 ? "#ff4444" : "white",
          //     textShadow: "0 0 6px black",
          //     fontFamily: "Arial, sans-serif",
          //     fontWeight: "bold",
          //     lineHeight: "36px",
          //     textAlign: "right",
          //     width: "fit-content",
          //     height: "36px"
          //   }
          // })

          wrapper.appendChild(clipText)
          // wrapper.appendChild(slashText)
          // wrapper.appendChild(totalText)
        }
      }),
    }
  })
}
