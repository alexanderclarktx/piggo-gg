import { Entity, HDiv, HImg, HText, NPC, Position } from "@piggo-gg/core"

export const HealthAmmo = (): Entity => {
  let init = false

  const ammoText = HText({
    style: { fontSize: "38px", position: "relative", marginLeft: "6px", textAlign: "center" }
  })

  const wrapper = HDiv({
    style: { left: "62%", bottom: "60px", display: "flex", alignItems: "center" }
  },
    HImg({
      src: "bullet.svg",
      style: { height: "36px", position: "relative", transform: "translate(0%, 0%)" }
    }),
    ammoText
  )

  return Entity({
    id: "healthAmmo",
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
          const ammo = activeItem?.components.gun?.ammo

          if (ammo === undefined) {
            wrapper.style.display = "none"
            return
          }

          ammoText.textContent = `${ammo}`
        }
      }),
    }
  })
}
