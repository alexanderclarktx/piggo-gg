import { Entity, HtmlDiv, NPC, Position, Three } from "@piggo-gg/core"

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
    transform: `rotate(${rotate}deg)`,
    // opacity: "0.8"
  })

  const topLeft = marker("-14px", "-10px", 45)
  const topRight = marker("4px", "-10px", -45)
  const bottomLeft = marker("-14px", "8px", -45)
  const bottomRight = marker("4px", "8px", 45)

  const fadeRate = 0.05

  const hitmarker = Entity({
    id: "hitmarker",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.client || !world.three) return

          if (!init) {
            wrapper.append(topLeft, topRight, bottomLeft, bottomRight)
            world.three?.append(wrapper)
            init = true
          }
        }
      }),
      three: Three({
        onRender: ({ world, delta, client }) => {
          const ratio = delta / 25

          const { localHit } = client.controls

          const opacity = Math.max(0, 1 - (world.tick - localHit + ratio) * fadeRate)
          topLeft.style.opacity = String(opacity)
          topRight.style.opacity = String(opacity)
          bottomLeft.style.opacity = String(opacity)
          bottomRight.style.opacity = String(opacity)
        }
      })
    }
  })

  return hitmarker
}
