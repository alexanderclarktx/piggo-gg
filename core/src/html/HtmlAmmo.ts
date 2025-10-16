import { Entity, HDiv, HText, NPC, Position } from "@piggo-gg/core"

export const HtmlAmmo = (): Entity => {
  let init = false

  const clipText = HText({
    style: { width: "400px" }
  })

  const wrapper = HDiv({
    style: { left: "50%", bottom: "40px" }
  },
    clipText
  )

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

          if (ammo === undefined) {
            wrapper.style.display = "none"
            return
          }

          clipText.textContent = `${ammo} / 0`
        }
      }),
    }
  })
}
