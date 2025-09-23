import { colors, Entity, Position, Three } from "@piggo-gg/core"
import { DirectionalLight, Mesh, MeshPhysicalMaterial, SphereGeometry } from "three"

export const Sun = () => {
  const sun = Entity<Three>({
    id: "sun",
    components: {
      position: Position({ x: 200, y: 200, z: 100}),
      three: Three({
        init: async () => {
          const light = new DirectionalLight(colors.evening, 9)

          light.shadow.normalBias = 0.02
          light.shadow.mapSize.set(2048 * 2, 2048 * 2)
          light.castShadow = true

          // widen the shadow
          light.shadow.camera.left = -20
          light.shadow.camera.right = 20
          light.shadow.camera.top = 30
          light.shadow.camera.bottom = -30
          // light.shadow.camera.updateProjectionMatrix()

          const geometry = new SphereGeometry(8, 32, 32)
          const sunSphereMaterial = new MeshPhysicalMaterial({
            emissive: colors.evening,
            emissiveIntensity: 1
          })
          const sunSphere = new Mesh(geometry, sunSphereMaterial)
          sunSphere.position.copy(light.position)

          sun.components.three.o.push(light, sunSphere)
        }
      })
    }
  })

  return sun
}
