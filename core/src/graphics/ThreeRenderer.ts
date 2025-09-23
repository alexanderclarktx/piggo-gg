import {
  CameraHelper, LinearMipMapNearestFilter, Mesh, MeshPhysicalMaterial,
  NearestFilter, Scene, SphereGeometry, SRGBColorSpace, Texture, TextureLoader, WebGLRenderer
} from "three"
import { isMobile, ThreeCamera, values, World } from "@piggo-gg/core"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export type ThreeRenderer = {

  // spruce: undefined | BlockMesh
  // oak: undefined | BlockMesh
  // leaf: undefined | BlockMesh
  // grass: undefined | BlockMesh

  sphere: undefined | Mesh<SphereGeometry, MeshPhysicalMaterial>

  canvas: HTMLCanvasElement
  camera: ThreeCamera
  debug: boolean
  fLoader: FBXLoader
  gLoader: GLTFLoader
  tLoader: TextureLoader
  ready: boolean
  scene: Scene

  append: (...elements: HTMLElement[]) => void
  setDebug: (state?: boolean) => void
  activate: (world: World) => void
  deactivate: () => void
  resize: () => void
  pointerLock: () => void // TODO move to Client
  pointerUnlock: () => void
}

export const ThreeRenderer = (c: HTMLCanvasElement): ThreeRenderer => {

  let webgl: undefined | WebGLRenderer
  let helper: undefined | CameraHelper

  const renderer: ThreeRenderer = {
    canvas: c,
    camera: ThreeCamera(),
    scene: new Scene(),
    sphere: undefined,
    // oak: undefined,
    // spruce: undefined,
    // leaf: undefined,
    // grass: undefined,
    debug: false,
    ready: false,
    fLoader: new FBXLoader(),
    gLoader: new GLTFLoader(),
    tLoader: new TextureLoader(),
    append: (...elements: HTMLElement[]) => {
      renderer.canvas.parentElement?.append(...elements)
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
    },
    setDebug: (state?: boolean) => {
      if (state === undefined) state = !renderer.debug
      if (renderer.debug === state) return

      renderer.debug = state

      if (!webgl) return

      if (renderer.debug) {
        // helper = new CameraHelper(renderer.sun.shadow.camera)
        // renderer.scene.add(helper)
        renderer.sphere!.material.opacity = 1
      } else if (!renderer.debug && helper) {
        renderer.scene.remove(helper)
        helper = undefined
        renderer.sphere!.material.opacity = 0
      }
    },
    pointerLock: () => {
      document.body.requestPointerLock({ unadjustedMovement: true })
    },
    pointerUnlock: () => {
      document.exitPointerLock()
    },
    activate: (world: World) => {
      if (renderer.ready) return
      renderer.ready = true

      // renderer.grass = BlockMesh(88000)
      // renderer.scene.add(renderer.grass)

      // renderer.spruce = BlockMesh(5000)
      // renderer.scene.add(renderer.spruce)

      // renderer.oak = BlockMesh(5000)
      // renderer.scene.add(renderer.oak)

      // renderer.leaf = BlockMesh(5000)
      // renderer.scene.add(renderer.leaf)

      renderer.sphere = new Mesh(
        new SphereGeometry(0.05),
        new MeshPhysicalMaterial({ color: 0x00ffff, wireframe: false, transparent: true, opacity: 0 }),
      )
      // renderer.scene.add(renderer.sphere)

      webgl = new WebGLRenderer({
        antialias: true,
        canvas: renderer.canvas,
        powerPreference: "high-performance",
        precision: "highp"
      })
      webgl.setPixelRatio(window.devicePixelRatio)

      renderer.resize()

      webgl.shadowMap.enabled = true
      webgl.shadowMap.type = 2

      // // roughness map
      // renderer.tLoader.load("dirt_norm.png", (texture: Texture) => {
      //   for (let i = 0; i < 6; i++) {
      //     renderer.grass!.material[i].roughnessMap = texture
      //     renderer.grass!.material[i].needsUpdate = true

      //     renderer.leaf!.material[i].roughnessMap = texture
      //     renderer.leaf!.material[i].needsUpdate = true
      //   }
      // })

      // // spruce roughness
      // renderer.tLoader.load("spruce-norm.png", (texture: Texture) => {
      //   for (let i = 0; i < 6; i++) {
      //     renderer.spruce!.material[i].roughnessMap = texture
      //     renderer.spruce!.material[i].needsUpdate = true

      //     renderer.oak!.material[i].roughnessMap = texture
      //     renderer.oak!.material[i].needsUpdate = true
      //   }
      // })

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
    }
  }
  return renderer
}
