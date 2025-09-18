import {
  CameraHelper, DirectionalLight, Group, HemisphereLight, LinearMipMapNearestFilter,
  Mesh, MeshPhysicalMaterial, NearestFilter, Object3DEventMap, Scene,
  SphereGeometry, SRGBColorSpace, Texture, TextureLoader, WebGLRenderer
} from "three"
import { abs, BlockMesh, cos, D3Camera, isMobile, max, PI, pow, World } from "@piggo-gg/core"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"

const evening = 0xffd9c3

export type D3Renderer = {
  apple: undefined | Group<Object3DEventMap>
  spruce: undefined | BlockMesh
  oak: undefined | BlockMesh
  leaf: undefined | BlockMesh
  blocks: undefined | BlockMesh
  canvas: HTMLCanvasElement
  camera: D3Camera
  debug: boolean
  fLoader: FBXLoader
  gLoader: GLTFLoader
  tLoader: TextureLoader
  scene: Scene
  sphere: undefined | Mesh<SphereGeometry, MeshPhysicalMaterial>
  sun: undefined | DirectionalLight
  append: (...elements: HTMLElement[]) => void
  setDebug: (state?: boolean) => void
  activate: (world: World) => void
  deactivate: () => void
  resize: () => void
  pointerLock: () => void // TODO move to Client
  pointerUnlock: () => void
}

export const D3Renderer = (c: HTMLCanvasElement): D3Renderer => {

  let webgl: undefined | WebGLRenderer
  let helper: undefined | CameraHelper

  const renderer: D3Renderer = {
    apple: undefined,
    canvas: c,
    camera: D3Camera(),
    scene: new Scene(),
    sphere: undefined,
    oak: undefined,
    spruce: undefined,
    leaf: undefined,
    blocks: undefined,
    debug: false,
    sun: undefined,
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
      webgl?.setAnimationLoop(null)
      webgl?.dispose()
      renderer.scene.clear()
    },
    setDebug: (state?: boolean) => {
      if (state === undefined) state = !renderer.debug
      if (renderer.debug === state) return

      renderer.debug = state

      if (!webgl || !renderer.sun) return

      if (renderer.debug) {
        helper = new CameraHelper(renderer.sun.shadow.camera)
        renderer.scene.add(helper)
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
      renderer.blocks = BlockMesh(88000)
      renderer.scene.add(renderer.blocks)

      renderer.spruce = BlockMesh(5000)
      renderer.scene.add(renderer.spruce)

      renderer.oak = BlockMesh(5000)
      renderer.scene.add(renderer.oak)

      renderer.leaf = BlockMesh(5000)
      renderer.scene.add(renderer.leaf)

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

      // hemisphere light
      const hemi = new HemisphereLight(0xaaaabb, evening, 3)
      renderer.scene.add(hemi)

      const sun = new DirectionalLight(evening, 9)

      renderer.sun = sun
      renderer.scene.add(sun)

      sun.position.set(200, 100, 200)
      sun.shadow.normalBias = 0.02
      sun.shadow.mapSize.set(2048 * 2, 2048 * 2)
      sun.castShadow = true

      // renderer.sun.target = renderer.sphere

      // widen the shadow
      sun.shadow.camera.left = -20
      sun.shadow.camera.right = 20
      sun.shadow.camera.top = 30
      sun.shadow.camera.bottom = -30
      sun.shadow.camera.updateProjectionMatrix()

      // textures

      renderer.tLoader.load("grass.png", (texture: Texture) => {
        for (let i = 0; i < 6; i++) {
          if (i === 2) continue
          renderer.blocks!.material[i].map = texture
          renderer.blocks!.material[i].map!.colorSpace = SRGBColorSpace

          renderer.blocks!.material[i].visible = true
          renderer.blocks!.material[i].needsUpdate = true
        }
        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      renderer.tLoader.load("grass-top.png", (texture: Texture) => {
        renderer.blocks!.material[2].map = texture
        renderer.blocks!.material[2].map.colorSpace = SRGBColorSpace
        renderer.blocks!.material[2].visible = true
        renderer.blocks!.material[2].needsUpdate = true

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      renderer.tLoader.load("dirt.png", (texture: Texture) => {
        for (let i = 0; i < 6; i++) {
          renderer.leaf!.material[i].map = texture
          renderer.leaf!.material[i].map!.colorSpace = SRGBColorSpace

          renderer.leaf!.material[i].needsUpdate = true
          renderer.leaf!.material[i].visible = true
        }

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      renderer.tLoader.load("oak-log.png", (texture: Texture) => {
        for (let i = 0; i < 6; i++) {
          renderer.oak!.material[i].map = texture
          renderer.oak!.material[i].map!.colorSpace = SRGBColorSpace

          renderer.oak!.material[i].needsUpdate = true
          renderer.oak!.material[i].visible = true
        }

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      renderer.tLoader.load("spruce-log.png", (texture: Texture) => {
        for (let i = 0; i < 6; i++) {
          renderer.spruce!.material[i].map = texture
          renderer.spruce!.material[i].map!.colorSpace = SRGBColorSpace

          renderer.spruce!.material[i].needsUpdate = true
          renderer.spruce!.material[i].visible = true
        }

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      // roughness map
      renderer.tLoader.load("dirt_norm.png", (texture: Texture) => {
        for (let i = 0; i < 6; i++) {
          renderer.blocks!.material[i].roughnessMap = texture
          renderer.blocks!.material[i].needsUpdate = true

          renderer.leaf!.material[i].roughnessMap = texture
          renderer.leaf!.material[i].needsUpdate = true
        }
      })

      // spruce roughness
      renderer.tLoader.load("spruce-norm.png", (texture: Texture) => {
        for (let i = 0; i < 6; i++) {
          renderer.spruce!.material[i].roughnessMap = texture
          renderer.spruce!.material[i].needsUpdate = true

          renderer.oak!.material[i].roughnessMap = texture
          renderer.oak!.material[i].needsUpdate = true
        }
      })

      const sunSphereGeometry = new SphereGeometry(8, 32, 32)
      const sunSphereMaterial = new MeshPhysicalMaterial({
        emissive: evening,
        emissiveIntensity: 1
      })
      const sunSphere = new Mesh(sunSphereGeometry, sunSphereMaterial)
      sunSphere.position.copy(sun.position)
      renderer.scene.add(sunSphere)

      renderer.gLoader.load("apple.glb", (apple) => {
        apple.scene.scale.set(0.16, 0.16, 0.16)

        renderer.apple = apple.scene

        apple.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      })

      // prevent right-click
      renderer.canvas.addEventListener("contextmenu", (event) => event.preventDefault())

      // handle screen resize
      window.addEventListener("resize", renderer.resize)

      // handle orientation change
      screen.orientation.addEventListener("change", renderer.resize)

      webgl.setAnimationLoop(() => {
        world.onRender?.()
        webgl?.render(renderer.scene, renderer.camera.c)

        // const hour = (world.tick / 30) % 24
        // const angle = ((hour - 6) / 24) * Math.PI * 2 // full 24h cycle

        const radius = 200

        // height goes up and down
        // const sunY = Math.sin(angle) * radius

        // arc is projected onto diagonal axis (X=Z)
        // const arc = Math.cos(angle) * radius
        // sun.position.set(arc, sunY, arc)

        // const hour = (world.tick / 30) % 24

        // // move sun
        // const sunHeight = cos((hour - 12) / 12 * PI) * 200
        // const sunArc = cos((hour - 6) / 12 * PI) * -100 + 29

        // sun.position.set(sunArc, sunHeight, sunArc)
        // sunSphere.position.copy(sun.position)

        // sun.visible = sunY > -10
        // sunSphere.visible = sun.visible

        // ambient light
        // const daytime = abs(hour - 12)
        // const bright = max(0, 2 - pow(daytime / 6, 2))
        // hemi.intensity = 3 + bright * 2

        // sun.intensity = 9 - bright * 3

        // console.log(sun.intensity.toFixed(1), hemi.intensity.toFixed(1))
      })
    }
  }
  return renderer
}
