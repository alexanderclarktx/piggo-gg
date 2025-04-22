import {
  Actions, Clickable, Effects, Entity, floor, Item, ItemActionParams,
  ItemBuilder, ItemEntity, mouse, pixiGraphics, Position,
  Renderable, round, World, XY, XYZ
} from "@piggo-gg/core"
import { Geometry, Graphics, Mesh, Shader, Buffer, BufferUsage } from "pixi.js"

const width = 18
const height = width / 3 * 2

export type BlockType = "grass" | "moss" | "moonrock" | "asteroid" | "saphire" | "obsidian" | "ruby"
export type Voxel = XYZ & { type: BlockType }

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

// block[] at some X
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
      onTick: ({ entity, world }) => {
        let visible = false

        const activeItem = world.client?.playerCharacter()?.components.inventory?.activeItem(world)
        if (activeItem && activeItem.id.startsWith("item-block-")) {
          visible = true
        }
        entity.components.renderable.visible = visible

        if (!visible) return

        // if (keys(xBlocksBuffer).length === 0) {
        //   buildXBlocksBuffer(world)
        // }

        const xyz = snapXYZ(world.flip(mouse))
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
        // const block = BlockMesh(snapXYZ(world.flip(mouse), world))

        // world.addEntity(block)
        // addToXBlocksBuffer(block)

        blocks.add({ ...snapXYZ(world.flip(mouse)), type })

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

export const snapXYZ = (pos: XY): XYZ => {
  return { z: highestBlock(pos).z, ...snapXY(pos) }
}

export const highestBlock = (pos: XY): XYZ => {
  const snapped = snapXY(pos)

  let level = 0

  // todo this is slow, should be a spatial hash ?
  for (const block of blocks.data) {
    const { x, y, z } = block
    if (x === snapped.x && y === snapped.y) {
      level = Math.max(level, z + 21)
    }
  }

  return { x: snapped.x, y: snapped.y, z: level }
}

type Blocks = {
  data: Voxel[]
  add: (block: Voxel) => void
  remove: (block: Voxel) => void
  sort: (world: World) => void
}

const Blocks = (): Blocks => {

  const keys: Set<string> = new Set()

  const blocks: Blocks = {
    data: [],
    add: (block: Voxel) => {
      if (keys.has(`${block.x}-${block.y}-${block.z}`)) return

      blocks.data.push(block)
      keys.add(`${block.x}-${block.y}-${block.z}`)
    },
    remove: (block: XYZ) => {
      const index = blocks.data.findIndex(b => b.x === block.x && b.y === block.y && b.z === block.z)
      if (index !== -1) {
        blocks.data.splice(index, 1)
        keys.delete(`${block.x}-${block.y}-${block.z}`)
      }
    },
    sort: (world: World) => {

      blocks.data.sort((a, b) => {
        const XYa = world.flip(a)
        const XYb = world.flip(b)

        if (XYa.y !== XYb.y) return XYa.y - XYb.y
        if (a.z !== b.z) return a.z - b.z
        return XYa.x - XYb.x
      })
    }
  }

  return blocks
}

export const blocks = Blocks()

const buffer = new Buffer({
  data: [
    0, 0
  ],
  usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
})

const geometry = new Geometry({
  instanceCount: 1,
  indexBuffer: [
    0, 1, 2,
    0, 2, 3,

    4, 5, 7,
    5, 7, 6,

    8, 9, 11,
    9, 11, 10,
  ],
  attributes: {
    aInstanceOffset: {
      instance: true,
      buffer
    },
    aUV: [
      // top
      0.0, 0.82, 0.0,
      0.0, 0.82, 0.0,
      0.0, 0.82, 0.0,
      0.0, 0.82, 0.0,

      // left (placeholder UVs)
      0.5, 0.2, 0.0,
      0.5, 0.2, 0.0,
      0.5, 0.2, 0.0,
      0.5, 0.2, 0.0,

      // right (placeholder UVs)
      0.6, 0.3, 0.0,
      0.6, 0.3, 0.0,
      0.6, 0.3, 0.0,
      0.6, 0.3, 0.0,
    ],
    aPosition: [
      // top
      0, 0,
      -width, -width / 2,
      0, -width,
      width, -width / 2,

      // bottom-left
      0, 0,
      -width, -width / 2,
      -width, height,
      0, height + width / 2,

      // bottom-right
      0, 0,
      width, -width / 2,
      width, height,
      0, height + width / 2,
    ]
  }
})

const vertexSrc = `
  precision mediump float;

  attribute vec2 aPosition;
  attribute vec3 aUV;
  attribute vec2 aInstanceOffset;

  uniform vec2 uResolution;
  uniform vec2 uOffset;
  uniform float uZoom;

  varying vec3 vUV;

  void main() {
    vUV = aUV;

    vec2 worldPos = aPosition + aInstanceOffset - vec2(0, 12);

    vec2 screenPos = (worldPos - uOffset) * uZoom;

    vec2 clip = (screenPos / uResolution) * 2.0;

    clip.y *= -1.0;

    gl_Position = vec4(clip.x, clip.y, 0, 1);
}
`

const fragmentSrc = `
  precision mediump float;

  varying vec3 vUV;

  void main() {
    gl_FragColor = vec4(vUV, 1.0);
  }
`

const shader = Shader.from({
  gl: {
    vertex: vertexSrc,
    fragment: fragmentSrc
  },
  resources: {
    uniforms: {
      uOffset: { value: [0, 0], type: 'vec2<f32>' },
      uResolution: { value: [window.innerWidth, window.innerWidth], type: 'vec2<f32>' },
      uZoom: { value: 2.0, type: 'f32' }
    }
  }
})

export const BlockMesh = () => Entity({
  id: "block-mesh",
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: 0,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      setup: async (r) => {
        const mesh = new Mesh({ geometry, shader })

        r.c = mesh
      },
      onRender: ({ world }) => {
        const zoom = world.renderer!.camera.scale
        const { x, y } = world.renderer!.camera.focus?.components.renderable.c.position ?? { x: 0, y: 0, z: 0 }
        const resolution = world.renderer!.wh()

        if (shader.resources.uniforms?.uniforms?.uZoom) {
          shader.resources.uniforms.uniforms.uZoom = zoom
          shader.resources.uniforms.uniforms.uOffset = [x, y]
          shader.resources.uniforms.uniforms.uResolution = resolution
        }

        blocks.sort(world)
        const { data } = blocks

        // vex2 array
        const newBufferData = []
        for (const { x, y, z } of data) {
          const xy = world.flip({ x, y })
          newBufferData.push(xy.x, xy.y - z)
        }

        // console.log("newBufferData", newBufferData)
        buffer.data = new Float32Array(newBufferData)
        geometry.instanceCount = data.length
      }
    })
  }
})
