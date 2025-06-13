import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three"

export type Three = {

}

export const Three = (canvas: HTMLCanvasElement): Three => {

  const scene = new Scene()

  const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000)
  camera.position.z = 1

  const geometry = new BoxGeometry(0.2, 0.2, 0.2)
  const mesh = new Mesh(geometry, new MeshNormalMaterial())

  // mesh.position.set(0, 0, 0.1)

  scene.add(mesh)

  const resize = () => {
    renderer.setSize(window.innerWidth * 0.98, window.innerHeight * 0.91)
  }

  const animate = (time: number) => {
    mesh.rotation.x = time / 2000
    mesh.rotation.y = time / 1000

    renderer.render(scene, camera)
  }

  const renderer = new WebGLRenderer({ antialias: true, canvas })

  renderer.setAnimationLoop(animate)

  const three: Three = {

  }

  resize()

  return three
}
