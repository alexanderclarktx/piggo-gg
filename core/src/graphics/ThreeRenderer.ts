import { isMobile, replaceCanvas, ThreeCamera, values, World } from "@piggo-gg/core"
import { Scene, TextureLoader, WebGLRenderer } from "three"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export type ThreeRenderer = {
  camera: ThreeCamera
  canvas: HTMLCanvasElement | undefined
  fLoader: FBXLoader
  gLoader: GLTFLoader
  ready: boolean
  scene: Scene
  tLoader: TextureLoader
  append: (...elements: HTMLElement[]) => void
  activate: (world: World) => void
  deactivate: () => void
  resize: () => void
  pointerLock: () => void // TODO move to Client
  pointerUnlock: () => void
}

export const ThreeRenderer = (): ThreeRenderer => {

  let webgl: undefined | WebGLRenderer

  const renderer: ThreeRenderer = {
    canvas: undefined,
    camera: ThreeCamera(),
    scene: new Scene(),
    ready: false,
    fLoader: new FBXLoader(),
    gLoader: new GLTFLoader(),
    tLoader: new TextureLoader(),
    append: (...elements: HTMLElement[]) => {
      const parent = document.getElementById("canvas-parent")
      if (parent) {
        // console.log("APPENDING ELEMENTS", elements.map(e => e.id), parent)
        parent.append(...elements)
      }
    },
    resize: () => {
      if (!webgl) return

      if (isMobile()) {
        // @ts-expect-error
        const height = (document.fullscreenElement || window.navigator.standalone) ? window.outerHeight : window.innerHeight

        webgl.setSize(window.innerWidth, height)
        renderer.camera.c.aspect = window.innerWidth / height
      } else {
        webgl.setSize(window.innerWidth * 0.98, window.innerHeight * 0.91)
        renderer.camera.c.aspect = window.innerWidth / window.innerHeight
      }

      renderer.camera.c.updateProjectionMatrix()
    },
    deactivate: () => {
      renderer.scene.clear()

      webgl?.setAnimationLoop(null)
      webgl?.dispose()

      for (const el of values(document.getElementsByClassName("lex"))) {
        el.remove()
      }

      renderer.ready = false
      console.log("WEBGL DEACTIVATED")
    },
    pointerLock: () => {
      document.body.requestPointerLock({ unadjustedMovement: true })
    },
    pointerUnlock: () => {
      document.exitPointerLock()
    },
    activate: (world: World) => {
      if (renderer.ready) return

      renderer.canvas = replaceCanvas()

      webgl = new WebGLRenderer({
        antialias: true,
        canvas: renderer.canvas,
        powerPreference: "high-performance",
        precision: "highp"
      })

      webgl.setPixelRatio(window.devicePixelRatio)
      webgl.shadowMap.enabled = true
      webgl.shadowMap.type = 2

      // prevent right-click
      renderer.canvas.addEventListener("contextmenu", (event) => event.preventDefault())

      // handle screen resize
      window.addEventListener("resize", renderer.resize)

      // handle orientation change
      screen.orientation.addEventListener("change", renderer.resize)

      webgl.setAnimationLoop(() => {
        world.onRender()

        webgl?.render(renderer.scene, renderer.camera.c)
      })

      renderer.resize()

      renderer.ready = true
    }
  }
  return renderer
}
