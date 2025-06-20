import {
  AmbientLight, BoxGeometry, BufferAttribute, CameraHelper, Color,
  DirectionalLight, InstancedMesh, MeshPhysicalMaterial, NearestFilter,
  Object3D, Scene, Texture, TextureLoader, WebGLRenderer
} from "three"
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from "postprocessing"
import { sin, cos, TCamera, World } from "@piggo-gg/core"

const evening = 0xffd9c3

export type TRenderer = {
  camera: TCamera
  setZoom: (zoom: number) => void
  debug: (state: boolean) => void
  activate: (world: World) => void
  deactivate: () => void
  resize: () => void
}

export const TRenderer = (c: HTMLCanvasElement): TRenderer => {

  let canvas: HTMLCanvasElement = c

  let renderer: undefined | WebGLRenderer
  let scene: undefined | Scene
  let sun: undefined | DirectionalLight
  let helper: undefined | CameraHelper

  let zoom = 2
  let debug = false

  const three: TRenderer = {
    camera: TCamera(),
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
    debug: (state: boolean) => {
      if (debug === state) return

      debug = state
      if (debug && renderer && scene && sun) {
        helper = new CameraHelper(sun.shadow.camera)
        scene.add(helper)
      } else if (!debug && renderer && scene && helper) {
        scene.remove(helper)
        helper = undefined
      }
    },
    activate: (world: World) => {
      document.body.requestPointerLock({ unadjustedMovement: true })

      document.body.addEventListener('click', () => {
        document.body.requestPointerLock()
      })

      // recreate the canvas
      const parent = canvas.parentElement
      canvas.remove()
      canvas = document.createElement("canvas")
      canvas.id = "canvas"
      parent?.appendChild(canvas)

      scene = new Scene()

      renderer = new WebGLRenderer({
        antialias: false, canvas, powerPreference: "high-performance"
      })

      three.resize()

      renderer.setAnimationLoop(() => {
        const t = performance.now() / 500

        // ambient lighting
        // ambient.intensity = 2 + sin(t)

        // rotate the sun
        // if (zoom > 1) sun!.position.set(1, sin(t) * 6, cos(t) * 10)

        // camera zoom
        // camera.position.set(-zoom, zoom * 0.5, zoom)

        world.onRender?.()

        composer.render()
      })

      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = 2

      sun = new DirectionalLight(evening, 10)
      scene.add(sun)

      sun.position.set(10, 6, 10)
      sun.shadow.normalBias = 0.02
      sun.shadow.mapSize.set(1024, 1024)
      sun.castShadow = true

      const ambient = new AmbientLight(evening, 1)
      scene.add(ambient)

      const geometry = new BoxGeometry(0.3, 0.3, 0.3)

      const instancedMesh = new InstancedMesh(geometry, new MeshPhysicalMaterial({
        vertexColors: true, visible: false, specularIntensity: 0.05
      }), 256)

      instancedMesh.castShadow = true
      instancedMesh.receiveShadow = true

      const TL = new TextureLoader()

      // texture
      TL.load("dirt.png", (texture: Texture) => {
        instancedMesh.material.map = texture

        instancedMesh.material.needsUpdate = true
        instancedMesh.material.visible = true

        texture.magFilter = NearestFilter
        texture.minFilter = NearestFilter
      })

      const mat = instancedMesh.material

      // roughness map
      TL.load("dirt_norm.png", (texture: Texture) => {
        mat.roughnessMap = texture
        instancedMesh.material.needsUpdate = true
      })

      // background
      TL.load("night.png", (texture: Texture) => {
        texture.magFilter = NearestFilter
        texture.minFilter = NearestFilter

        texture.mapping = 301
        texture.colorSpace = "srgb"

        texture.needsUpdate = true
        scene!.background = texture
      })

      const camera = three.camera.c

      const composer = new EffectComposer(renderer, { multisampling: 4 })
      composer.addPass(new RenderPass(scene, camera))

      composer.addPass(new EffectPass(camera, new BloomEffect({
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0.1,
        intensity: 0.4,
        resolutionScale: 2
      })))

      composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.LOW })))

      const position = geometry.attributes.position
      const colorAttr = new Float32Array(position.count * 3)

      const faceColors = [
        new Color(0xaaaaaa),
        new Color(0xaaaaaa),
        new Color(0x00ee55),
        new Color(0xaaaaaa),
        new Color(0xaaaaaa),
        new Color(0xaaaaaa)
      ]

      // color the faces
      for (let i = 0; i < position.count; i++) {
        const faceIndex = Math.floor(i / 4)
        const color = faceColors[faceIndex]
        colorAttr.set([color.r, color.g, color.b], i * 3)
      }

      geometry.setAttribute('color', new BufferAttribute(colorAttr, 3))

      const dummy = new Object3D()

      // arrange blocks in 2D grid
      for (let i = 0; i < 256; i++) {
        dummy.position.set((i % 16) * 0.3 - 0.45, 0, Math.floor(i / 16) * 0.3 - 0.45)

        if ([31, 67, 134, 121].includes(i)) dummy.position.y = 0.3

        dummy.updateMatrix()
        instancedMesh.setMatrixAt(i, dummy.matrix)
      }

      scene.add(instancedMesh)

      canvas.addEventListener("wheel", (event: WheelEvent) => {
        zoom += 0.01 * Math.sign(event.deltaY) * Math.sqrt(Math.abs(event.deltaY))
        zoom = Math.max(1, Math.min(zoom, 10))
      })

      // prevent right-click
      canvas.addEventListener("contextmenu", (event) => event.preventDefault())
    }
  }
  return three
}
