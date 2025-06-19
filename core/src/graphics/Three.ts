import {
  AmbientLight, BoxGeometry, BufferAttribute, CameraHelper, Color, DirectionalLight,
  InstancedMesh, MeshPhysicalMaterial, NearestFilter, Object3D,
  PerspectiveCamera, Scene, Texture, TextureLoader, Vector3, WebGLRenderer
} from "three"
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from "postprocessing"
import { sin, cos, max } from "@piggo-gg/core"

const evening = 0xffd9c3

export type Three = {
  setZoom: (zoom: number) => void
  debug: (state: boolean) => void
  activate: () => void
  deactivate: () => void
  resize: () => void
}

export const Three = (c: HTMLCanvasElement): Three => {

  let canvas: HTMLCanvasElement = c

  let renderer: undefined | WebGLRenderer
  let scene: undefined | Scene
  let sun: undefined | DirectionalLight
  let helper: undefined | CameraHelper

  let zoom = 2
  let debug = false

  let vert = 0
  let hori = 0

  const three: Three = {
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
    activate: () => {

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
        const t = performance.now() / 1000

        // ambient lighting
        // ambient.intensity = 2 + sin(t)

        // rotate the sun
        // if (zoom > 1) sun.position.set(0, sin(t) * 6, cos(t) * 10)

        // camera zoom
        // camera.position.set(-zoom, zoom * 0.5, zoom)

        composer.render()
      })

      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = 2

      const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000)
      camera.position.set(-1, 1, 1)
      camera.lookAt(0, 0, 0)
      camera.rotation.order = 'YXZ'

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
      }), 16)

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
        new Color(0x00ff00),
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
      for (let i = 0; i < 16; i++) {
        dummy.position.set((i % 4) * 0.3 - 0.45, 0, Math.floor(i / 4) * 0.3 - 0.45)

        if (i === 10) dummy.position.y = 0.3

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

      window.addEventListener('mousemove', (e) => {
        if (!document.pointerLockElement) return

        vert -= e.movementY * 0.001
        hori -= e.movementX * 0.001

        vert = max(-1.5, Math.min(1.5, vert))

        camera.rotation.set(vert, hori, 0)
      })
      document.body.requestPointerLock()

      document.body.addEventListener('click', () => {
        document.body.requestPointerLock()
      })

      // inputs
      window.addEventListener("keydown", (event) => {
        const k = event.key.toLowerCase()

        if (k === "b") three.debug(!debug)
        if (k === "r") three.resize()

        if (k === " ") {
          camera.position.y += 0.1
        }
        if (k === "shift") {
          camera.position.y -= 0.1
        }

        if (k === "a") {
          const t = new Vector3(0, 0, 0)
          camera.getWorldDirection(t)
          t.y = 0
          t.normalize()

          const left = new Vector3()
          left.crossVectors(camera.up, t).normalize()

          camera.position.addScaledVector(left, 0.1)
        }
        if (k === "d") {
          const t = new Vector3(0, 0, 0)
          camera.getWorldDirection(t)
          t.y = 0
          t.normalize()

          const right = new Vector3()
          right.crossVectors(t, camera.up).normalize()

          camera.position.addScaledVector(right, 0.1)
        }
        if (k === "w") {
          const t = new Vector3(0, 0, 0)
          camera.getWorldDirection(t)
          t.y = 0
          t.normalize()

          camera.position.addScaledVector(t, 0.1)
        }
        if (k === "s") {
          const t = new Vector3(0, 0, 0)
          camera.getWorldDirection(t)
          t.y = 0
          t.normalize()

          camera.position.addScaledVector(t, -0.1)
        }
      })
    }
  }
  return three
}
