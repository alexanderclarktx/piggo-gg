import {
  AmbientLight, AnimationMixer, CameraHelper, DirectionalLight, Group, Scene,
  LinearMipMapNearestFilter, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  NearestFilter, Object3DEventMap, RepeatWrapping, SphereGeometry, SRGBColorSpace,
  Texture, TextureLoader, WebGLRenderer, CylinderGeometry
} from "three"
import { D3BlockMesh, D3Camera, isMobile, World } from "@piggo-gg/core"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const evening = 0xffd9c3

type laserMesh = Mesh<CylinderGeometry, MeshBasicMaterial, Object3DEventMap>

export type D3Renderer = {
  apple: undefined | Group<Object3DEventMap>
  spruce: undefined | D3BlockMesh
  oak: undefined | D3BlockMesh
  leaf: undefined | D3BlockMesh
  blocks: undefined | D3BlockMesh
  canvas: HTMLCanvasElement
  camera: D3Camera
  debug: boolean
  birdAssets: Record<string, {
    duck: Group<Object3DEventMap>
    eagle: Group<Object3DEventMap>
    laser: laserMesh
    mixers: AnimationMixer[]
  }>
  gLoader: GLTFLoader
  tLoader: TextureLoader
  laser: undefined | laserMesh
  scene: Scene
  sphere: undefined | Mesh<SphereGeometry, MeshPhysicalMaterial>
  sun: undefined | DirectionalLight
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

  // const TL = new TextureLoader()
  // const GL = new GLTFLoader()

  let webgl: undefined | WebGLRenderer
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
    laser: undefined,
    leaf: undefined,
    blocks: undefined,
    birdAssets: {},
    debug: false,
    sun: undefined,
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

      renderer.spruce = D3BlockMesh(500)
      renderer.scene.add(renderer.spruce)

      renderer.oak = D3BlockMesh(500)
      renderer.scene.add(renderer.oak)

      renderer.leaf = D3BlockMesh(500)
      renderer.scene.add(renderer.leaf)

      renderer.sphere = new Mesh(
        new SphereGeometry(0.05),
        new MeshPhysicalMaterial({ color: 0x00ffff, wireframe: true })
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

      const ambient = new AmbientLight(evening, 1.2)
      renderer.scene.add(ambient)

      const sun = new DirectionalLight(evening, 9)
      renderer.sun = sun
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

      // texture
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

      // background
      renderer.tLoader.load("night.png", (texture: Texture) => {
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

      // laser
      const laserGeo = new CylinderGeometry(0.01, 0.01, 1, 8)
      laserGeo.translate(0, 0.5, 0)

      const material = new MeshBasicMaterial({ color: 0xff0000, transparent: true })
      const laserMesh = new Mesh(laserGeo, material)
      laserMesh.scale.y = 14

      renderer.laser = laserMesh

      const sunSphereGeometry = new SphereGeometry(10, 32, 32)
      const sunSphereMaterial = new MeshPhysicalMaterial({
        emissive: evening,
        emissiveIntensity: 1
      })
      const sunSphere = new Mesh(sunSphereGeometry, sunSphereMaterial)
      sunSphere.position.copy(sun.position)
      renderer.scene.add(sunSphere)

      // renderer.gLoader.load("ugly-duckling.glb", (duck) => {
      //   renderer.duck = duck.scene
      //   renderer.duck.animations = duck.animations

      //   duck.scene.traverse((child) => {
      //     if (child instanceof Mesh) {
      //       child.castShadow = true
      //       child.receiveShadow = true
      //     }
      //   })
      // })

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
    },
    sunLookAt: (x: number, y: number, z: number) => {
      if (renderer.sun) {
        renderer.sun.shadow.camera.lookAt(x, z, y)
        renderer.sun.shadow.camera.updateProjectionMatrix()
        renderer.sun.shadow.camera.updateMatrixWorld()
      } else {
        console.warn("Sun not initialized")
      }
    }
  }
  return renderer
}
