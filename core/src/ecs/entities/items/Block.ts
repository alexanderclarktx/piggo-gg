import {
  Actions, Clickable, Collider, Debug, Effects, Element, Entity,
  floor,
  Item, ItemActionParams, ItemBuilder, ItemEntity, keys, mouse,
  pixiGraphics, Position, Renderable, round, values, World, XY, XYZ
} from "@piggo-gg/core"
import { Geometry, Graphics, Mesh, Shader } from "pixi.js"

const width = 18
const height = width / 3 * 2

export type BlockType = "grass" | "moss" | "moonrock" | "asteroid" | "saphire" | "obsidian" | "ruby"

const BlockColors: Record<BlockType, [number, number, number]> = {
  grass: [0x08d000, 0x6E260E, 0x7B3F00],
  moss: [0x08bb00, 0x6E260E, 0x7B3F00],
  moonrock: [0xcbdaf2, 0x98b0d9, 0xdddddd],
  asteroid: [0x8b8b8b, 0x6E6E6E, 0xECF0F1],
  saphire: [0x00afff, 0x007fff, 0x00cfff],
  obsidian: [0x330055, 0x550077, 0xaa00aa],
  ruby: [0x660033, 0x880000, 0xff0000]
}

const graphics: Record<BlockType, Graphics | undefined> = {
  grass: undefined,
  moss: undefined,
  moonrock: undefined,
  asteroid: undefined,
  saphire: undefined,
  obsidian: undefined,
  ruby: undefined
}

const blockGraphics = (type: BlockType) => {
  if (graphics[type]) return graphics[type]

  const colors = BlockColors[type]

  graphics[type] = pixiGraphics()
    // top
    .moveTo(0, 0)
    .lineTo(-width, -width / 2)
    .lineTo(0, -width)
    .lineTo(width, -width / 2)
    .lineTo(0, 0)
    .fill({ color: colors[0] })

    // bottom-left
    .moveTo(-width, -width / 2)
    .lineTo(-width, height)
    .lineTo(0, height + width / 2)
    .lineTo(0, 0)
    .fill({ color: colors[1] })

    // bottom-right
    .lineTo(0, height + width / 2)
    .lineTo(width, height)
    .lineTo(width, -width / 2)
    .fill({ color: colors[2] })

  return graphics[type]
}

export const Block = (pos: XYZ, type: BlockType) => Entity<Position>({
  id: `block-${pos.x}-${pos.y}-${pos.z}`,
  components: {
    position: Position({ ...pos }),
    // debug: Debug(),
    element: Element("rock"),
    collider: Collider({
      cullable: true,
      group: (pos.z / 21 + 1).toString() as "1" | "2" | "3",
      hittable: pos.z > 0 ? true : false,
      isStatic: true,
      shape: "line",
      points: [
        0, width / 2,
        -width, 0,
        0, 3 - height,
        width, 0,
        0, width / 2
      ]
    }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3,
      cullable: true,
      dynamic: ({ entity, world }) => {
        // if (world.tick % 200 !== 0) return
        if (
          world.entity(`block-${pos.x}-${pos.y}-${pos.z + 21}`) &&
          world.entity(`block-${pos.x - width}-${pos.y + width / 2}-${pos.z}`) &&
          world.entity(`block-${pos.x + width}-${pos.y + width / 2}-${pos.z}`)
        ) {
          entity.components.renderable.visible = false
          // console.log("block hidden")
        } else {
          // entity.components.renderable.visible = true
          // console.log("block visible")
        }
      },
      setup: async (r) => {
        const clone = blockGraphics(type).clone()
        clone.position.y = -height
        r.c.addChild(clone)

        // if (pos.z > 0) {
          r.setOutline({ color: 0x000000, thickness: 0.2 })
        // }
      }
    })
  }
})

// takes ij integer coordinates -> XY of that block from origin
export const intToBlock = (i: number, j: number): XY => ({
  x: (i - j) * width,
  y: (i + j) * width / 2
})

const xyBlock = (pos: XY): XY => {
  const half = width / 2
  const gridX = (pos.x / width + pos.y / half) / 2
  const gridY = (pos.y / half - pos.x / width) / 2
  const tileX = round(gridX)
  const tileY = round(gridY)
  return { x: tileX, y: tileY }
}

export const snapXYToChunk = (pos: XY): XY => {
  const snapped = xyBlock(pos)
  const x = floor(snapped.x / 4)
  const y = floor(snapped.y / 4)
  return { x, y }
}

export const snapXY = (pos: XY): XY => {
  const half = width / 2

  // Convert to isometric grid coords (skewed grid space)
  const gridX = (pos.x / width + pos.y / half) / 2
  const gridY = (pos.y / half - pos.x / width) / 2

  // Snap to nearest tile
  const tileX = round(gridX)
  const tileY = round(gridY)

  // Convert back to screen position (center of tile)
  const snappedX = (tileX - tileY) * width
  const snappedY = (tileX + tileY) * half

  return { x: snappedX, y: snappedY }
}

export const snapXYZ = (pos: XY, world: World): XYZ => {
  return { z: highestBlock(pos, world).z, ...snapXY(pos) }
}

export const highestBlock = (pos: XY, world: World): XYZ => {
  const snapped = snapXY(pos)

  const blocks = values(world.entities).filter((e) => e.id.startsWith("block-"))
  let level = 0

  // todo this is slow, should be a spatial hash ?
  for (const block of blocks) {
    const { x, y, z } = block.components.position!.data
    if (x === snapped.x && y === snapped.y) {
      level = Math.max(level, z + 21)
    }
  }

  return { x: snapped.x, y: snapped.y, z: level }
}

type XBlocks = Record<number, Entity<Position>[]>

// todo move to an entity
const xBlocksBuffer: XBlocks = {}

const buildXBlocksBuffer = (world: World): XBlocks => {
  const blocks = world.queryEntities<Position>(["position"], x => x.id.startsWith("block-"))

  for (const block of blocks) {
    const { x } = block.components.position.data
    if (!xBlocksBuffer[x]) {
      xBlocksBuffer[x] = []
    }
    xBlocksBuffer[x].push(block)
  }

  return xBlocksBuffer
}

const addToXBlocksBuffer = (block: Entity<Position>) => {
  const { x } = block.components.position.data
  if (!xBlocksBuffer[x]) {
    xBlocksBuffer[x] = []
  }
  xBlocksBuffer[x].push(block)
}

// use the xBlocksBuffer to find the block at the mouse position
const blockAtMouse = (mouse: XY): XYZ | null => {
  const snapped = snapXY(mouse)

  // sort by Z desc then Y desc
  const blocks = xBlocksBuffer[snapped.x]
  if (!blocks) return null

  // sort by Z desc
  blocks.sort((a, b) => {
    const zA = a.components.position.data.z
    const zB = b.components.position.data.z
    return zB - zA
  })

  // sort by Y asc
  blocks.sort((a, b) => {
    const yA = a.components.position.data.y
    const yB = b.components.position.data.y
    return yB - yA
  })

  for (const block of blocks) {
    const { x, y, z } = block.components.position.data

    const bottom = y - z
    const top = bottom - height - width

    if (mouse.y <= bottom && mouse.y >= top) {
      return { x, y, z }
    }
  }

  return null
}

export const BlockPreview = () => Entity({
  id: "item-block-preview",
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: 3,
      anchor: { x: 0.5, y: 0 },
      position: { x: 0, y: 0 },
      dynamic: ({ entity, world }) => {
        let visible = false

        const activeItem = world.client?.playerCharacter()?.components.inventory?.activeItem(world)
        if (activeItem && activeItem.id.startsWith("item-block-")) {
          visible = true
        }
        entity.components.renderable.visible = visible

        if (!visible) return

        if (keys(xBlocksBuffer).length === 0) {
          buildXBlocksBuffer(world)
        }

        const xyz = snapXYZ(world.flip(mouse), world)
        // const xyz = blockAtMouse(mouse)

        if (!xyz) {
          entity.components.renderable.visible = false
        } else {
          entity.components.renderable.visible = true
          entity.components.position.setPosition(xyz)
        }
      },
      setup: async (r) => {
        const g = pixiGraphics()
          // top
          .moveTo(0, 0)
          .lineTo(-width, -width / 2)
          .lineTo(0, -width)
          .lineTo(width, -width / 2)
          .lineTo(0, 0)

          // bottom-left
          .moveTo(-width, -width / 2)
          .lineTo(-width, height)
          .lineTo(0, height + width / 2)
          .lineTo(0, 0)

          // bottom-right
          .lineTo(0, height + width / 2)
          .lineTo(width, height)
          .lineTo(width, -width / 2)
          .stroke()

        g.position.y = -height

        r.c.addChild(g)

        r.setGlow({ outerStrength: 1 })
      }
    })
  }
})

export const BlockItem = (type: BlockType): ItemBuilder => ({ character, id }) => ItemEntity({
  id: id ?? `item-block-${character.id}-${type}`,
  components: {
    position: Position({ follows: character?.id ?? "" }),
    actions: Actions({
      mb1: ({ params, world }) => {
        const { hold, mouse } = params as ItemActionParams
        if (hold) return

        // const block = Block(snapXYZ(world.flip(mouse), world), type)
        // const block = Block(snapXYZ(world.flip(mouse), world), type)
        const block = BlockMesh(snapXYZ(world.flip(mouse), world))

        world.addEntity(block)
        // addToXBlocksBuffer(block)

        world.client?.soundManager.play("click2")
      }
    }),
    item: Item({ name: "block", flips: false }),
    effects: Effects(),
    clickable: Clickable({ width: 20, height: 20, active: false, anchor: { x: 0.5, y: 0.5 } }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3,
      scale: 0.3,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      visible: false,
      rotates: false,
      setup: async (r) => {
        const clone = blockGraphics(type).clone()
        clone.position.y = -height
        r.c = clone

        r.setOutline({ color: 0x000000, thickness: 1 })
      }
    })
  }
})


// -----------------------------


// Block size and simple projection (2D iso-style layout)
// const BLOCK_WIDTH = 64
// const BLOCK_HEIGHT = 32

// Build a simple geometry for a diamond-shaped isometric block face
function createBlockGeometry(): Geometry {
  const geometry = new Geometry()

  const positions = new Float32Array([
    0, 0,                  // top
    -width, width / 2,                   // left
    0, width,                   // bottom
    width, width / 2,                    // right
  ])

  const uvs = new Float32Array([
    0.5, 0.0,
    0.0, 0.5,
    0.5, 1.0,
    1.0, 0.5,
  ])

  const indices = new Uint16Array([
    0, 1, 2,
    0, 2, 3
  ])

  geometry.addAttribute('aVertexPosition', positions)
  geometry.addAttribute('aUV', uvs)
  geometry.addIndex(indices)

  return geometry
}

const vertexSrc = `
  precision mediump float;

  attribute vec2 aVertexPosition;
  attribute vec2 aUV;

  uniform vec2 uResolution;
  uniform vec2 uOffset;
  uniform vec2 uScale;
  uniform float uZoom;

  varying vec2 vUV;

  void main() {
    vec2 position = aVertexPosition * uScale + uOffset;
    vec2 scaled = position * uZoom;

    vec2 clip = (scaled / uResolution) * 4.0 - 1.0;
    clip.y *= -1.0; // Invert Y for WebGL (top-left becomes bottom-left)
    gl_Position = vec4(clip, 0.0, 1.0);

    
    // gl_Position = vec4((position / 100.0), 0.0, 1.0);
    // // vUV = aUV;
  }
`

const fragmentSrc = `
  precision mediump float;

  varying vec2 vUV;

  void main() {
    // vec3 color = mix(vec3(0.8, 0.4, 0.2), vec3(0.2, 0.8, 1.0), vUV.y);
    gl_FragColor = vec4(0.2, 0.8, 0.8, 1.0);
  }
`

const geometry = createBlockGeometry()
const shader = Shader.from({
  gl: {
    vertex: vertexSrc,
    fragment: fragmentSrc
  },
  // gpu: {
  //   vertex: {
  //     source: vertexSrc
  //   },
  //   fragment: {
  //     source: fragmentSrc
  //   }
  // },
  resources: {
    uniforms: {
      uOffset: { value: [100, 100], type: 'vec2<f32>' },
      uScale: { value: [1.0, 1.0], type: 'vec2<f32>' },
      uResolution: { value: [window.innerWidth, window.innerWidth], type: 'vec2<f32>' },
      uZoom: { value: 2.0, type: 'f32' }
    }
  }
})

const BlockMesh = (xyz: XYZ) => Entity({
  id: "block-mesh",
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: 10,
      anchor: { x: 0.5, y: 0.5 },
      setup: async (r) => {
        const mesh = new Mesh({ geometry, shader })

        r.c = mesh
      },
      dynamic: ({ world }) => {
        const zoom = world.renderer!.camera.scale

        if (shader.resources.uniforms?.uniforms?.uZoom) {
          shader.resources.uniforms.uniforms.uZoom = zoom
        }
      }
    })
  }
})
