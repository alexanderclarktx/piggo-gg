import {
  AmbientLight, BoxGeometry, BufferAttribute, CameraHelper, Color, DirectionalLight,
  InstancedMesh, MeshPhysicalMaterial, NearestFilter, Object3D,
  PerspectiveCamera, Scene, Texture, TextureLoader, WebGLRenderer
} from "three"

const evening = 0xffd9c3

export type Three = {
  setZoom: (zoom: number) => void
}

export const Three = (canvas: HTMLCanvasElement): Three => {

  const scene = new Scene()

  let zoom = 2

  const renderer = new WebGLRenderer({ antialias: true, canvas })

  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = 2

  renderer.setAnimationLoop((time: number) => {
    // rotate+zoom
    // camera.position.set(Math.sin(time / 3000) * -zoom, zoom * 0.5, Math.cos(time / 3000) * zoom)

    // zoom
    camera.position.set(-zoom, zoom * 0.5, zoom)

    camera.lookAt(0, 0, 0)

    // rotate the sun
    if (zoom > 1) light.position.set(Math.sin(time / 5000) * 10, 6, Math.cos(time / 5000) * 10)

    renderer.render(scene, camera)
  })

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000)
  camera.position.set(-1, 1, 1)
  camera.lookAt(0, 0, 0)

  const light = new DirectionalLight(evening, 10)
  light.position.set(10, 6, 10)

  light.shadow.normalBias = 0.02
  light.shadow.mapSize.set(1024, 1024)
  light.castShadow = true

  // scene.add(new CameraHelper(light.shadow.camera))

  scene.add(light)

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
  TL.load("dirt_nn.png", (texture: Texture) => {
    mat.roughnessMap = texture
    instancedMesh.material.needsUpdate = true
  })

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

  // arrange in a 2d grid (x/z)
  for (let i = 0; i < 16; i++) {
    dummy.position.set((i % 4) * 0.3 - 0.45, 0, Math.floor(i / 4) * 0.3 - 0.45)

    if (i === 10) dummy.position.y = 0.3

    dummy.updateMatrix()
    instancedMesh.setMatrixAt(i, dummy.matrix)
  }

  scene.add(instancedMesh)

  const resize = () => {
    renderer.setSize(window.innerWidth * 0.98, window.innerHeight * 0.91)
  }

  canvas.addEventListener("wheel", (event: WheelEvent) => {
    zoom += 0.01 * Math.sign(event.deltaY) * Math.sqrt(Math.abs(event.deltaY))
    zoom = Math.max(1, Math.min(zoom, 10))
  })

  resize()

  return {
    setZoom: (z: number) => zoom = z
  }
}
