import {
  AmbientLight, AnimationMixer, CameraHelper, DirectionalLight, InstancedMesh,
  Mesh, MeshBasicMaterial, MeshPhysicalMaterial, NearestFilter, RepeatWrapping,
  Scene, SphereGeometry, Texture, TextureLoader, WebGLRenderer
} from "three"
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from "postprocessing"
import { sin, cos, TCamera, World, Radial, TBlockMesh } from "@piggo-gg/core"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

const evening = 0xffd9c3

export type TRenderer = {
  camera: TCamera
  sphere: undefined | InstancedMesh<SphereGeometry, MeshPhysicalMaterial>
  sphere2: undefined | Mesh<SphereGeometry, MeshPhysicalMaterial>
  blocks: undefined | TBlockMesh
  mixers: AnimationMixer[]
  setZoom: (zoom: number) => void
  debug: (state?: boolean) => void
  activate: (world: World) => void
  deactivate: () => void
  resize: () => void
  pointerLock: () => void
  pointerUnlock: () => void
  sunLookAt: (x: number, y: number, z: number) => void
}

export const TRenderer = (c: HTMLCanvasElement): TRenderer => {

  let canvas: HTMLCanvasElement = c

  let renderer: undefined | WebGLRenderer
  let scene: undefined | Scene
  let sun: undefined | DirectionalLight
  let helper: undefined | CameraHelper
  let radial: undefined | Radial

  let zoom = 2
  let debug = false

  const glbLoader = new GLTFLoader()

  const tRenderer: TRenderer = {
    camera: TCamera(),
    sphere: undefined,
    sphere2: undefined,
    blocks: undefined,
    mixers: [],
    setZoom: (z: number) => zoom = z,
    resize: () => {
      if (renderer) {
        renderer.setSize(window.innerWidth * 0.98, window.innerHeight * 0.91)
      }
    },
    deactivate: () => {
      renderer?.setAnimationLoop(null)
      renderer?.dispose()
      scene?.clear()
    },
    debug: (state?: boolean) => {
      if (state === undefined) state = !debug
      if (debug === state) return

      debug = state
      if (debug && renderer && scene && sun) {
        helper = new CameraHelper(sun.shadow.camera)
        scene.add(helper)
        tRenderer.sphere!.visible = true
        tRenderer.sphere2!.visible = true
        // tRenderer.sphere!.instanceMatrix.needsUpdate = true
      } else if (!debug && renderer && scene && helper) {
        scene.remove(helper)
        helper = undefined
        tRenderer.sphere!.visible = false
        tRenderer.sphere2!.visible = false
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
      const parent = canvas.parentElement
      canvas.remove()
      canvas = document.createElement("canvas")
      canvas.id = "canvas"
      parent?.appendChild(canvas)

      scene = new Scene()

      tRenderer.blocks = TBlockMesh()
      scene.add(tRenderer.blocks)

      tRenderer.sphere = new InstancedMesh(
        new SphereGeometry(0.15),
        new MeshPhysicalMaterial({
          color: 0xffd9c3,
          emissive: 0xffd9c3,
          emissiveIntensity: 1,
          roughness: 0.1
        }),
        10
      )
      tRenderer.sphere2 = new Mesh(
        new SphereGeometry(0.1),
        new MeshPhysicalMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 1,
          roughness: 0.1
        })
      )
      tRenderer.sphere.visible = false
      tRenderer.sphere2.visible = false
      scene.add(tRenderer.sphere)
      scene.add(tRenderer.sphere2)

      // radial = Radial(["A", "B", "C"])
      // scene.add(radial.group)

      renderer = new WebGLRenderer({
        antialias: false, canvas, powerPreference: "high-performance"
      })

      tRenderer.resize()

      renderer.setAnimationLoop(() => {
        const t = performance.now() / 5000

        if (radial) radial.update(world)

        // animations
        for (const mixer of tRenderer.mixers) {
          mixer.update(0.01)
        }

        // ambient lighting
        // ambient.intensity = 2 + sin(t)

        // rotate the sun
        // if (zoom > 1) sun!.position.set(cos(t) * 200, sin(t) * 100, cos(t) * 200)

        // sunSphere.position.copy(sun!.position)

        world.onRender?.()

        composer.render()
      })

      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = 2

      sun = new DirectionalLight(evening, 10)
      scene.add(sun)

      sun.position.set(200, 100, 200)
      sun.shadow.normalBias = 0.02
      sun.shadow.mapSize.set(2048, 2048)
      sun.castShadow = true

      // widen the shadow
      sun.shadow.camera.left = -25
      sun.shadow.camera.right = 25
      sun.shadow.camera.top = 10
      sun.shadow.camera.bottom = -20
      sun.shadow.camera.updateProjectionMatrix()

      const ambient = new AmbientLight(evening, 1)
      scene.add(ambient)

      const TL = new TextureLoader()

      // texture
      TL.load("dirt.png", (texture: Texture) => {
        tRenderer.blocks!.material.map = texture

        tRenderer.blocks!.material.needsUpdate = true
        tRenderer.blocks!.material.visible = true

        texture.magFilter = NearestFilter
        texture.minFilter = NearestFilter
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

        scene!.add(mesh)
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
      scene.add(sunSphere)

      const camera = tRenderer.camera.c

      const composer = new EffectComposer(renderer, { multisampling: 4 })
      composer.addPass(new RenderPass(scene, camera))

      composer.addPass(new EffectPass(camera, new BloomEffect({
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0.1,
        intensity: 0.4,
        resolutionScale: 2
      })))

      composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.LOW })))

      canvas.addEventListener("wheel", (event: WheelEvent) => {
        zoom += 0.01 * Math.sign(event.deltaY) * Math.sqrt(Math.abs(event.deltaY))
        zoom = Math.max(1, Math.min(zoom, 10))
      })

      glbLoader.load("eagle.glb", (gltf) => {
        const eagle = gltf.scene
        eagle.scale.set(0.1, 0.1, 0.1)
        eagle.position.set(3, 3, 3)
        scene?.add(eagle)

        const mixer = new AnimationMixer(eagle)
        mixer.clipAction(gltf.animations[0]).play()

        tRenderer.mixers.push(mixer)

        eagle.castShadow = true
        eagle.receiveShadow = true

        eagle.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true

            if (child.material && "skinning" in child.material) {
              child.material.skinning = true
              child.material.needsUpdate = true
            }
          }
        })
      })

      // prevent right-click
      canvas.addEventListener("contextmenu", (event) => event.preventDefault())
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
