import { colors, Entity, Three } from "@piggo-gg/core"
import { DirectionalLight } from "three"

export const Sun = () => {
  const sun = Entity<Three>({
    id: "sun",
    components: {
      three: Three({
        init: async () => {
          const light = new DirectionalLight(colors.evening, 9)

          light.position.set(200, 100, 200)
          light.shadow.normalBias = 0.02
          light.shadow.mapSize.set(2048 * 2, 2048 * 2)
          light.castShadow = true

          // widen the shadow
          light.shadow.camera.left = -20
          light.shadow.camera.right = 20
          light.shadow.camera.top = 30
          light.shadow.camera.bottom = -30
          light.shadow.camera.updateProjectionMatrix()
        }
      })
    }
  })

  return sun
}
