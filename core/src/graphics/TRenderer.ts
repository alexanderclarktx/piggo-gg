import {
  AmbientLight, AnimationMixer, CameraHelper, DirectionalLight, Group,
  InstancedMesh, LinearMipMapNearestFilter, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, MeshStandardMaterial, NearestFilter, Object3DEventMap,
  RepeatWrapping, Scene, SphereGeometry, Texture, TextureLoader, WebGLRenderer
} from "three"
import { hypot, PI, Radial, sqrt, TBlockMesh, TCamera, World } from "@piggo-gg/core"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const evening = 0xffd9c3

export type TRenderer = {
  apples: Record<string, Group<Object3DEventMap>>
  blocks: undefined | TBlockMesh
  canvas: HTMLCanvasElement
  camera: TCamera
  debug: boolean
  duck: undefined | GLTF
  eagle: undefined | GLTF
  mixers: AnimationMixer[]
  scene: Scene
  sphere: undefined | InstancedMesh<SphereGeometry, MeshPhysicalMaterial>
  sphere2: undefined | Mesh<SphereGeometry, MeshPhysicalMaterial>
  setZoom: (zoom: number) => void
  setDebug: (state?: boolean) => void
  activate: (world: World) => void
  deactivate: () => void
  resize: () => void
  pointerLock: () => void
  pointerUnlock: () => void
  sunLookAt: (x: number, y: number, z: number) => void
}

export const TRenderer = (c: HTMLCanvasElement): TRenderer => {

  const TL = new TextureLoader()
  const GL = new GLTFLoader()

  let renderer: undefined | WebGLRenderer
  let sun: undefined | DirectionalLight
  let helper: undefined | CameraHelper
  let radial: undefined | Radial

  let zoom = 2

  const tRenderer: TRenderer = {
    apples: {},
    canvas: c,
    camera: TCamera(),
    scene: new Scene(),
    sphere: undefined,
    sphere2: undefined,
    blocks: undefined,
    mixers: [],
    debug: false,
    duck: undefined,
    eagle: undefined,
    setZoom: (z: number) => {
      zoom = z
    },
    resize: () => {
      if (!renderer) return

      renderer.setSize(window.innerWidth * 0.98, window.innerHeight * 0.91)

      tRenderer.camera.c.aspect = window.innerWidth / window.innerHeight
      tRenderer.camera.c.updateProjectionMatrix()
    },
    deactivate: () => {
      renderer?.setAnimationLoop(null)
      renderer?.dispose()
      tRenderer.scene.clear()
    },
    setDebug: (state?: boolean) => {
      if (state === undefined) state = !tRenderer.debug
      if (tRenderer.debug === state) return

      tRenderer.debug = state

      if (!renderer || !sun) return

      if (tRenderer.debug) {
        helper = new CameraHelper(sun.shadow.camera)
        tRenderer.scene.add(helper)
      } else if (!tRenderer.debug && helper) {
        tRenderer.scene.remove(helper)
        helper = undefined
      }
    },
    pointerLock: () => {
      document.body.requestPointerLock({ unadjustedMovement: true })
    },
    pointerUnlock: () => {
      document.exitPointerLock()
    },
    activate: (world: World) => {
      tRenderer.pointerLock()

      // recreate the canvas
      const parent = tRenderer.canvas.parentElement
      tRenderer.canvas.remove()
      tRenderer.canvas = document.createElement("canvas")
      tRenderer.canvas.id = "canvas"
      parent?.appendChild(tRenderer.canvas)

      tRenderer.blocks = TBlockMesh()
      tRenderer.scene.add(tRenderer.blocks)

      tRenderer.sphere = new InstancedMesh(
        new SphereGeometry(0.16),
        new MeshPhysicalMaterial({
          color: 0xffd9c3,
          emissiveIntensity: 0,
          roughness: 0.5
        }), 12
      )
      tRenderer.sphere.frustumCulled = false
      tRenderer.sphere.visible = false
      tRenderer.scene.add(tRenderer.sphere)

      tRenderer.sphere2 = new Mesh(
        new SphereGeometry(0.05),
        new MeshPhysicalMaterial({
          color: 0x00ffff,
          emissiveIntensity: 0.5,
          roughness: 0.5,
          wireframe: true,
        })
      )
      tRenderer.sphere2.castShadow = true
      tRenderer.sphere2.receiveShadow = true
      tRenderer.sphere2.visible = false
      tRenderer.scene.add(tRenderer.sphere2)

      // radial = Radial(["A", "B", "C"])
      // tRenderer.scene.add(radial.group)

      renderer = new WebGLRenderer({
        antialias: true,
        canvas: tRenderer.canvas,
        powerPreference: "high-performance"
      })

      tRenderer.resize()

      renderer.setAnimationLoop(() => {
        const t = performance.now() / 5000

        if (radial) radial.update(world)

        // update duck position
        const pc = world.client?.playerCharacter()
        const { duck, eagle, debug, sphere, sphere2 } = tRenderer

        if (pc && duck && eagle) {

          const { aim, velocity, flying } = pc.components.position.data

          eagle.scene.rotation.y = aim.x
          eagle.scene.rotation.x = aim.y
          // duck.scene.rotation.y = aim.x + PI / 2 + rotation - rotating * (40 - delta) / 40

          // visibility
          duck.scene.visible = debug ? false : !flying
          eagle.scene.visible = debug ? false : flying
          sphere!.visible = debug
          sphere2!.visible = debug

          // animations
          for (const mixer of tRenderer.mixers) {
            // mixer.update(0.01)
            if (flying) {
              mixer.update(sqrt(hypot(velocity.x, velocity.y, velocity.z)) * 0.005 + 0.01)
            } else {
              mixer.update(hypot(velocity.x, velocity.y) * 0.015 + 0.01)
            }
          }
        }

        // ambient lighting
        // ambient.intensity = 2 + sin(t)

        // rotate the sun
        // if (zoom > 1) sun!.position.set(cos(t) * 200, sin(t) * 100, cos(t) * 200)

        // sunSphere.position.copy(sun!.position)

        world.onRender?.()

        renderer!.render(tRenderer.scene, tRenderer.camera.c)
      })

      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = 2

      sun = new DirectionalLight(evening, 10)
      tRenderer.scene.add(sun)

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

      const ambient = new AmbientLight(evening, 1)
      tRenderer.scene.add(ambient)

      // texture
      TL.load("dirt.png", (texture: Texture) => {
        tRenderer.blocks!.material.map = texture

        tRenderer.blocks!.material.needsUpdate = true
        tRenderer.blocks!.material.visible = true

        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapNearestFilter
      })

      const mat = tRenderer.blocks.material

      // roughness map
      TL.load("dirt_norm.png", (texture: Texture) => {
        mat.roughnessMap = texture
        tRenderer.blocks!.material.needsUpdate = true
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

        const mesh = new Mesh(sphere, material)

        tRenderer.scene.add(mesh)
      })

      const sunSphereGeometry = new SphereGeometry(10, 32, 32)
      const sunSphereMaterial = new MeshPhysicalMaterial({
        color: 0xffd9c3,
        emissive: 0xffd9c3,
        emissiveIntensity: 1,
        roughness: 0.1,
      })
      const sunSphere = new Mesh(sunSphereGeometry, sunSphereMaterial)
      sunSphere.position.copy(sun.position)
      tRenderer.scene.add(sunSphere)

      // canvas.addEventListener("wheel", (event: WheelEvent) => {
      //   zoom += 0.01 * Math.sign(event.deltaY) * Math.sqrt(Math.abs(event.deltaY))
      //   zoom = Math.max(1, Math.min(zoom, 10))
      // })

      GL.load("eagle.glb", (eagle) => {
        tRenderer.eagle = eagle
        eagle.scene.scale.set(0.05, 0.05, 0.05)
        eagle.scene.position.set(3, 3, 3)
        tRenderer.scene.add(eagle.scene)

        eagle.scene.rotation.order = "YXZ"

        const mixer = new AnimationMixer(eagle.scene)
        mixer.clipAction(eagle.animations[0]).play()

        tRenderer.mixers.push(mixer)

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

      GL.load("duck.glb", (duck) => {
        tRenderer.duck = duck
        duck.scene.scale.set(0.08, 0.08, 0.08)
        tRenderer.scene.add(duck.scene)

        const mixer = new AnimationMixer(duck.scene)
        mixer.clipAction(duck.animations[1]).play()

        tRenderer.mixers.push(mixer)

        duck.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      })

      GL.load("apple.glb", (apple) => {
        apple.scene.scale.set(0.16, 0.16, 0.16)

        tRenderer.apples["apple-0"] = apple.scene

        apple.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      })

      // prevent right-click
      tRenderer.canvas.addEventListener("contextmenu", (event) => event.preventDefault())

      // handle screen resize
      window.addEventListener("resize", tRenderer.resize)
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
  return tRenderer
}
