import {
  AmbientLight, AnimationMixer, CameraHelper, DirectionalLight, Group,
  InstancedMesh, LinearMipMapNearestFilter, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, MeshStandardMaterial, NearestFilter, Object3DEventMap,
  RepeatWrapping, Scene, SphereGeometry, Texture, TextureLoader, WebGLRenderer
} from "three"
import { entries, hypot, isMobile, Radial, sqrt, TBlockMesh, TCamera, World } from "@piggo-gg/core"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const evening = 0xffd9c3

export type TRenderer = {
  apples: Record<string, Group<Object3DEventMap>>
  blocks: undefined | TBlockMesh
  canvas: HTMLCanvasElement
  camera: TCamera
  debug: boolean
  playerAssets: Record<string, {
    duck: Group<Object3DEventMap>
    eagle: Group<Object3DEventMap>
    mixers: AnimationMixer[]
  }>
  duck: undefined | Group<Object3DEventMap>
  eagle: undefined | Group<Object3DEventMap>
  scene: Scene
  sphere: undefined | InstancedMesh<SphereGeometry, MeshPhysicalMaterial>
  sphere2: undefined | Mesh<SphereGeometry, MeshPhysicalMaterial>
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

  const tRenderer: TRenderer = {
    apples: {},
    canvas: c,
    camera: TCamera(),
    scene: new Scene(),
    sphere: undefined,
    sphere2: undefined,
    blocks: undefined,
    playerAssets: {},
    debug: false,
    duck: undefined,
    eagle: undefined,
    resize: () => {
      if (!renderer) return

      if (isMobile()) {
        renderer.setSize(window.innerWidth, window.outerHeight)
        tRenderer.camera.c.aspect = window.innerWidth / window.outerHeight
      } else {
        renderer.setSize(window.innerWidth * 0.98, window.innerHeight * 0.91)
        tRenderer.camera.c.aspect = window.innerWidth / window.innerHeight
      }

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

        if (radial) radial.update(world)

        // const { playerAssets } = tRenderer

        // for (const [id, { mixers }] of entries(playerAssets)) {
        //   const character = world.entity(id)
        //   if (!character) continue

        //   const { position } = character.components
        //   if (!position) continue

        //   const { flying } = position.data

        //   for (const mixer of mixers) {
        //     if (flying) {
        //       mixer.update(sqrt(hypot(position.data.velocity.x, position.data.velocity.y, position.data.velocity.z)) * 0.005 + 0.01)
        //     } else {
        //       mixer.update(hypot(position.data.velocity.x, position.data.velocity.y) * 0.015 + 0.01)
        //     }
        //   }
        // }

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

      // roughness map
      TL.load("dirt_norm.png", (texture: Texture) => {
        tRenderer.blocks!.material.roughnessMap = texture
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
        emissive: evening,
        emissiveIntensity: 1
      })
      const sunSphere = new Mesh(sunSphereGeometry, sunSphereMaterial)
      sunSphere.position.copy(sun.position)
      tRenderer.scene.add(sunSphere)

      GL.load("eagle.glb", (eagle) => {
        tRenderer.eagle = eagle.scene

        tRenderer.eagle.animations = eagle.animations
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
        tRenderer.duck = duck.scene

        tRenderer.duck.animations = duck.animations

        duck.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      })

      GL.load("apple.glb", (apple) => {
        apple.scene.scale.set(0.16, 0.16, 0.16)

        tRenderer.apples["tapple-0"] = apple.scene

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
