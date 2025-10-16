import { Entity, HDiv, HText, NPC } from "@piggo-gg/core"

export const PhaseBanner = () => {

  let init = false

  let readyText = HText({ text: "", style: { position: "relative", width: "200px", textAlign: "center" } })

  const wrapper = HDiv({
    style: {
      left: "50%", top: "20px", transform: "translate(-50%)", display: "flex", alignItems: "center", flexDirection: "column"
    }
  },
    HText({
      text: "Warmup",
      style: { fontSize: "32px", position: "relative" }
    }),
    readyText
  )

  return Entity({
    id: "PhaseBanner",
    components: {
      npc: NPC({
        behavior: (_, world) => {
          if (!init) {
            init = true
            document.body.appendChild(wrapper)
          }

          const players = world.players().filter(p => p.id !== "player-dummy")

          const ready = players.filter(p => (p.components.pc.data.ready)).length

          readyText.textContent = `ready: ${ready}/${players.length}`

          // wrapper.style.visibility = world.client?.net.lobbyId ? "visible" : "hidden"
        }
      })
    }
  })
}
