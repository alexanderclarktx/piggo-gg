import {
  AmbientLight, AnimationMixer, CameraHelper, DirectionalLight, Group,
  LinearFilter,
  LinearMipMapLinearFilter,
  LinearMipMapNearestFilter, LinearSRGBColorSpace, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  MeshStandardMaterial, NearestFilter, NearestMipmapNearestFilter, NoColorSpace, Object3DEventMap, RepeatWrapping,
  Scene, SphereGeometry, SRGBColorSpace, Texture, TextureLoader, WebGLRenderer
} from "three"
import { isMobile, D3BlockMesh, D3Camera, World } from "@piggo-gg/core"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const evening = 0xffd9c3

export type D3Renderer = {
  apple: undefined | Group<Object3DEventMap>
  spruce: undefined | D3BlockMesh
  oak: undefined | D3BlockMesh
  blocks: undefined | D3BlockMesh
  canvas: HTMLCanvasElement
  camera: D3Camera
  debug: boolean
  birdAssets: Record<string, {
    duck: Group<Object3DEventMap>
    eagle: Group<Object3DEventMap>
    mixers: AnimationMixer[]
  }>
  duck: undefined | Group<Object3DEventMap>
  eagle: undefined | Group<Object3DEventMap>
  scene: Scene
  sphere: undefined | Mesh<SphereGeometry, MeshPhysicalMaterial>
  append: (...elements: HTMLElement[]) => void
  setDebug: (state?: boolean) => void
  activate: (world: World) => void
  deactivate: () => void
  resize: () => void
  pointerLock: () => void
  pointerUnlock: () => void
  sunLookAt: (x: number, y: number, z: number) => void
}

export const D3Renderer = (c: HTMLCanvasElement): D3Renderer => {

  const TL = new TextureLoader()
  const GL = new GLTFLoader()

  let webgl: undefined | WebGLRenderer
  let sun: undefined | DirectionalLight
  let helper: undefined | CameraHelper
  let background: undefined | Mesh<SphereGeometry, MeshBasicMaterial>

  const renderer: D3Renderer = {
    apple: undefined,
    canvas: c,
    camera: D3Camera(),
    scene: new Scene(),
    sphere: undefined,
    oak: undefined,
    spruce: undefined,
    blocks: undefined,
    birdAssets: {},
    debug: false,
    duck: undefined,
    eagle: undefined,
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

      if (!webgl || !sun) return

      if (renderer.debug) {
        helper = new CameraHelper(sun.shadow.camera)
        renderer.scene.add(helper)
        renderer.sphere!.visible = true
      } else if (!renderer.debug && helper) {
        renderer.scene.remove(helper)
        helper = undefined
        renderer.sphere!.visible = false
      }
    },
    pointerLock: () => {
      document.body.requestPointerLock({ unadjustedMovement: true })
    },
    pointerUnlock: () => {
      document.exitPointerLock()
    },
    activate: (world: World) => {
      renderer.blocks = D3BlockMesh()
      renderer.scene.add(renderer.blocks)

      renderer.spruce = D3BlockMesh(false, 500)
      renderer.scene.add(renderer.spruce)

      renderer.oak = D3BlockMesh(false, 500)
      renderer.scene.add(renderer.oak)

      renderer.sphere = new Mesh(
        new SphereGeometry(0.05),
        new MeshPhysicalMaterial({
          color: 0x00ffff,
          emissiveIntensity: 0.5,
          roughness: 0.5,
          wireframe: true,
        })
      )
      renderer.sphere.visible = false
      renderer.scene.add(renderer.sphere)

      webgl = new WebGLRenderer({
        antialias: true,
        canvas: renderer.canvas,
        powerPreference: "high-performance",
        precision: "highp"
      })

      webgl.setPixelRatio(window.devicePixelRatio)

      renderer.resize()

      webgl.setAnimationLoop(() => {
        world.onRender?.()
        webgl?.render(renderer.scene, renderer.camera.c)
      })

      webgl.shadowMap.enabled = true
      webgl.shadowMap.type = 2

      sun = new DirectionalLight(evening, 10)
      renderer.scene.add(sun)

      sun.position.set(200, 100, 200)
      sun.shadow.normalBias = 0.02
      sun.shadow.mapSize.set(2048 * 2, 2048 * 2)
      sun.castShadow = true

      // widen the shadow
      sun.shadow.camera.left = -25
      sun.shadow.camera.right = 25
      sun.shadow.camera.top = 10
      sun.shadow.camera.bottom = -20
      sun.shadow.camera.updateProjectionMatrix()

      const ambient = new AmbientLight(evening, 1.1)
      renderer.scene.add(ambient)

      // texture
      TL.load("dirt.png", (texture: Texture) => {
        renderer.blocks!.material.map = texture
        // renderer.blocks!.material.map.colorSpace = SRGBColorSpace
        renderer.blocks!.material.map.colorSpace = LinearSRGBColorSpace

        renderer.blocks!.material.needsUpdate = true
        renderer.blocks!.material.visible = true

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      TL.load("oak-log.png", (texture: Texture) => {
        renderer.oak!.material.map = texture
        renderer.oak!.material.map.colorSpace = SRGBColorSpace

        renderer.oak!.material.needsUpdate = true
        renderer.oak!.material.visible = true

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      TL.load("spruce-log.png", (texture: Texture) => {
        renderer.spruce!.material.map = texture
        renderer.spruce!.material.map.colorSpace = SRGBColorSpace

        renderer.spruce!.material.needsUpdate = true
        renderer.spruce!.material.visible = true

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      // roughness map
      TL.load("dirt_norm.png", (texture: Texture) => {
        renderer.blocks!.material.roughnessMap = texture
        renderer.blocks!.material.needsUpdate = true
      })

      // spruce roughness
      TL.load("spruce-norm.png", (texture: Texture) => {
        renderer.spruce!.material.roughnessMap = texture
        renderer.spruce!.material.needsUpdate = true

        renderer.oak!.material.roughnessMap = texture
        renderer.oak!.material.needsUpdate = true
      })

      // background
      TL.load("night.png", (texture: Texture) => {
        texture.magFilter = NearestFilter
        texture.minFilter = NearestFilter

        texture.mapping = 301
        texture.colorSpace = "srgb"

        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(3.5, 2.5)

        const sphere = new SphereGeometry(500, 60, 40)

        const material = new MeshBasicMaterial({ map: texture, side: 1 })

        background = new Mesh(sphere, material)

        renderer.scene.add(background)
      })

      const sunSphereGeometry = new SphereGeometry(10, 32, 32)
      const sunSphereMaterial = new MeshPhysicalMaterial({
        emissive: evening,
        emissiveIntensity: 1
      })
      const sunSphere = new Mesh(sunSphereGeometry, sunSphereMaterial)
      sunSphere.position.copy(sun.position)
      renderer.scene.add(sunSphere)

      GL.load("eagle.glb", (eagle) => {
        renderer.eagle = eagle.scene

        renderer.eagle.animations = eagle.animations
        eagle.scene.rotation.order = "YXZ"

        const colors: Record<string, number> = {
          Cylinder: 0x5C2421,
          Cylinder_1: 0xE7C41C,
          Cylinder_2: 0xffffff,
          Cylinder_3: 0x632724
        }

        eagle.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.material = new MeshStandardMaterial({ color: colors[child.name] })
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      })

      GL.load("ugly-duckling.glb", (duck) => {
        renderer.duck = duck.scene

        renderer.duck.animations = duck.animations

        duck.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      })

      GL.load("apple.glb", (apple) => {
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
    },
    sunLookAt: (x: number, y: number, z: number) => {
      if (sun) {
        sun.shadow.camera.lookAt(x, z, y)
        sun.shadow.camera.updateProjectionMatrix()
        sun.shadow.camera.updateMatrixWorld()
      } else {
        console.warn("Sun not initialized")
      }
    }
  }
  return renderer
}
