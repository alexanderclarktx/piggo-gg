import { colors, Entity, Position, Three } from "@piggo-gg/core"
import { CameraHelper, DirectionalLight, HemisphereLight, Mesh, MeshPhysicalMaterial, SphereGeometry } from "three"

export type SunProps = {
  bounds?: { left: number, right: number, top: number, bottom: number }
}

export const Sun = (props: SunProps = {}) => {
  const sun = Entity<Three>({
    id: "sun",
    components: {
      position: Position({ x: 200, y: 200, z: 100 }),
      three: Three({
        init: async () => {
          const light = new DirectionalLight(colors.evening, 9)

          light.shadow.normalBias = 0.02
          light.shadow.mapSize.set(2048 * 2, 2048 * 2)
          light.castShadow = true

          // widen the shadow
          light.shadow.camera.left = props.bounds?.left ?? -20
          light.shadow.camera.right = props.bounds?.right ?? 20
          light.shadow.camera.top = props.bounds?.top ?? 30
          light.shadow.camera.bottom = props.bounds?.bottom ?? -30

          const sphere = new Mesh(
            new SphereGeometry(8, 32, 32),
            new MeshPhysicalMaterial({
              emissive: colors.evening,
              emissiveIntensity: 1
            })
          )

          light.position.set(200, 100, 200)
          sphere.position.set(200, 100, 200)

          const hemi = new HemisphereLight(0xaaaabb, colors.evening, 3)

          const helper = new CameraHelper(light.shadow.camera)

          sun.components.three.o.push(light, sphere, hemi, helper)
        }
      })
    }
  })

  return sun
}
