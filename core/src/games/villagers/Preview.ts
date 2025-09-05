import { blockFromXYZ, floor, hypot, min, PI, World, XYZ } from "@piggo-gg/core"
import { BoxGeometry, Color, EdgesGeometry, Mesh, MeshBasicMaterial, Object3DEventMap, PlaneGeometry, ShaderMaterial, SphereGeometry, Vector2 } from "three"


// Mesh<CylinderGeometry, MeshBasicMaterial, Object3DEventMap>
export type Preview = {
  mesh: Mesh
  update: (pos: XYZ, dir: XYZ) => void
}

export const Preview = (world: World): null | Preview => {
  if (!world.client) return null

  // const geometry = new PlaneGeometry(0.3, 0.3)
  const geometry = new BoxGeometry(0.301, 0.301, 0.301)
  // const edgeGeo = new EdgesGeometry(geometry, 80)
  const material = new MeshBasicMaterial({ color: 0xffffff, side: 2 })
  const mat = OutlinesMaterial

  const mesh = new Mesh(geometry, mat)
  mesh.position.set(10, 10, 10)
  return {
    mesh,
    update: (pos: XYZ, dir: XYZ) => {
      // mesh.position.copy(pos)
      // mesh.lookAt(aim)

      // console.log("update from", pos, dir)

      const current = { ...pos }

      const lastBlock = blockFromXYZ(current)

      let travelled = 0
      let cap = 10

      while (travelled < 10 && cap > 0) {

        const xGap = (current.x + 0.15) % 0.3
        const yGap = (current.y + 0.15) % 0.3
        const zGap = current.z % 0.3

        const xStep = dir.x > 0 ? (0.3 - xGap) / dir.x : (xGap / -dir.x)
        const yStep = dir.z > 0 ? (0.3 - yGap) / dir.z : (yGap / -dir.z)
        const zStep = dir.y > 0 ? (0.3 - zGap) / dir.y : (zGap / -dir.y)

        const minStep = min(xStep, yStep, zStep)

        const xDist = dir.x * minStep * 1.01
        const yDist = dir.z * minStep * 1.01
        const zDist = dir.y * minStep * 1.01

        current.x += xDist
        current.y += yDist
        current.z += zDist

        travelled += hypot(xDist, yDist, zDist)
        cap -= 1

        const insideBlock = {
          x: floor((0.15 + current.x) / 0.3),
          y: floor((0.15 + current.y) / 0.3),
          z: floor(current.z / 0.3)
        }

        const type = world.blocks.atIJK(insideBlock)
        if (type) {

          mesh.position.x = insideBlock.x * 0.3
          mesh.position.y = insideBlock.z * 0.3 + 0.15
          mesh.position.z = insideBlock.y * 0.3
          mesh.rotation.set(0, 0, 0)

          mesh.visible = true
          return
        }
      }

      mesh.visible = false
    }
  }
}

const vertexShader = `
  varying vec2 vUv;
  void main()	{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`

const fragmentShader = `
  //#extension GL_OES_standard_derivatives : enable
  
  varying vec2 vUv;
  uniform float thickness;

  float edgeFactor(vec2 p){
    vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float d = min(grid.x, grid.y);
    return step(d, 1.0/thickness);
  }
  
  void main() {
    float edge = edgeFactor(vUv);
    vec3 c = mix(vec3(0.9, 0.9, 1.0), vec3(0), edge);
    gl_FragColor = vec4(c, edge);
  }
`

const OutlinesMaterial = new ShaderMaterial(
  {
    transparent: true,
    opacity: 1,
    uniforms: {
      thickness: {
        value: 0.6
      }
    },
    vertexShader,
    fragmentShader
  }
)
