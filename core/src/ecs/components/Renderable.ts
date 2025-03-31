import { Component, Entity, Renderer, World, XY, keys, values, Position } from "@piggo-gg/core"
import { AdvancedBloomFilter, GlowFilter, OutlineFilter } from "pixi-filters"
import { AnimatedSprite, Container, Filter, Graphics, Sprite } from "pixi.js"

export type Dynamic = ((_: { container: Container, renderable: Renderable, entity: Entity<Renderable | Position>, world: World }) => void)

export type Renderable = Component<"renderable"> & {
  activeAnimation: string
  anchor: XY
  animation: AnimatedSprite | undefined
  animations: Record<string, AnimatedSprite>
  animationSelect: null | ((entity: Entity<Position | Renderable>, world: World) => string)
  animationColor: number
  bufferedAnimation: string
  c: Container
  children: Renderable[] | undefined
  cullable: boolean
  color: number
  filters: Filter[]
  interactiveChildren: boolean
  interpolate: boolean
  initialized: boolean
  position: XY
  r: Renderable | undefined
  rendered: boolean
  renderer: Renderer
  rotates: boolean
  outline: { color: number, thickness: number }
  scale: number
  scaleMode: "nearest" | "linear"
  visible: boolean
  zIndex: number

  setContainer: ((r: Renderer) => Promise<Container>) | undefined
  setChildren: ((r: Renderer) => Promise<Renderable[]>) | undefined
  setup: ((renderable: Renderable, renderer: Renderer, w: World) => Promise<void>) | undefined
  dynamic: Dynamic | undefined

  prepareAnimations: (color?: number, alpha?: number) => void
  setScale: (xy: XY) => void
  _init: (renderer: Renderer | undefined, world: World) => Promise<void>
  setAnimation: (animationKey: string) => void
  setBloom: (_?: { threshold?: number, bloomScale?: number }) => void
  setGlow: (_?: { color?: number, quality?: number, innerStrength?: number, outerStrength?: number }) => void
  setOutline: (_?: { color: number, thickness: number }) => void
  cleanup: () => void
}

export type RenderableProps = {
  alpha?: number
  anchor?: XY
  animations?: Record<string, AnimatedSprite>
  animationSelect?: (entity: Entity<Position | Renderable>, world: World) => string
  animationColor?: number
  cacheAsBitmap?: boolean
  color?: number
  cullable?: boolean
  filters?: Filter[]
  interactiveChildren?: boolean
  interpolate?: boolean
  position?: XY
  rotates?: boolean
  outline?: { color: number, thickness: number }
  scale?: number
  scaleMode?: "nearest" | "linear"
  visible?: boolean
  zIndex?: number
  dynamic?: Dynamic
  setChildren?: (r: Renderer) => Promise<Renderable[]>
  setContainer?: (r: Renderer) => Promise<Container>
  setup?: (renderable: Renderable, renderer: Renderer, w: World) => Promise<void> // todo single arg
}

export const Renderable = (props: RenderableProps): Renderable => {

  const renderable: Renderable = {
    type: "renderable",
    activeAnimation: "",
    anchor: props.anchor ?? { x: 0.5, y: 0.5 },
    animation: undefined,
    animations: props.animations ?? {},
    animationColor: props.animationColor ?? 0xffffff,
    animationSelect: props.animationSelect ?? null,
    bufferedAnimation: "",
    c: new Container(),
    r: undefined,
    color: props.color ?? 0xffffff,
    children: undefined,
    cullable: props.cullable ?? false,
    dynamic: props.dynamic,
    filters: props.filters ?? [],
    interactiveChildren: props.interactiveChildren ?? false,
    interpolate: props.interpolate ?? false,
    initialized: false,
    position: props.position ?? { x: 0, y: 0 },
    rotates: props.rotates ?? false,
    outline: props.outline ?? { color: 0x000000, thickness: 0 },
    scale: props.scale ?? 1,
    scaleMode: props.scaleMode ?? "linear",
    setChildren: props.setChildren ?? undefined,
    setContainer: props.setContainer ?? undefined,
    setup: props.setup ?? undefined,
    visible: props.visible ?? true,
    zIndex: props.zIndex ?? 0,
    rendered: false,
    renderer: undefined as unknown as Renderer,
    prepareAnimations: (color: number = 0xffffff, alpha: number = 1) => {
      values(renderable.animations).forEach((animation: AnimatedSprite) => {
        animation.animationSpeed = 0.1
        animation.scale.set(renderable.scale)
        animation.anchor.set(renderable.anchor.x, renderable.anchor.y)
        animation.texture.source.scaleMode = renderable.scaleMode
        animation.tint = color
        animation.alpha = alpha
      })
      renderable.bufferedAnimation = keys(renderable.animations)[0]
    },
    setScale: (xy: XY) => {
      const { x, y } = xy
      if (keys(renderable.animations).length) {
        values(renderable.animations).forEach((animation: AnimatedSprite) => {
          if (x != animation.scale.x || y != animation.scale.y) {
            animation.scale.set(x * renderable.scale, y * renderable.scale)
          }
        })
      } else {
        renderable.c.scale.set(x * renderable.scale, y * renderable.scale)
      }
    },
    setAnimation: (animationKey: string) => {
      if (values(renderable.animations).length && renderable.animations[animationKey]) {
        renderable.bufferedAnimation = animationKey
      }
    },
    setBloom: (props: { threshold?: number, bloomScale?: number } = {}) => {
      const threshold = props.threshold ?? 0.5
      const bloomScale = props.bloomScale ?? 1
      if (keys(renderable.animations).length) {
        values(renderable.animations).forEach((animation) => {
          animation.filters = [new AdvancedBloomFilter({ threshold, bloomScale })]
        })
      } else {
        renderable.c.filters = [...renderable.filters, new AdvancedBloomFilter({ threshold, bloomScale })]
      }
    },
    setGlow: (props: { color?: number, quality?: number, innerStrength?: number, outerStrength?: number } = {}) => {
      const color = props.color ?? 0xffffff
      const quality = props.quality ?? 1
      const innerStrength = props.innerStrength ?? 0
      const outerStrength = props.outerStrength ?? 0
      if (keys(renderable.animations).length) {
        values(renderable.animations).forEach((animation) => {
          animation.filters = [new GlowFilter({ color, quality, innerStrength, outerStrength })]
        })
      } else {
        renderable.c.filters = [...renderable.filters, new GlowFilter({ color, quality, innerStrength, outerStrength })]
      }
    },
    setOutline: (props?: { color: number, thickness: number }) => {
      const { thickness, color } = props ?? renderable.outline
      if (keys(renderable.animations).length) {
        values(renderable.animations).forEach((animation) => {
          animation.filters = [new OutlineFilter({ thickness, color, quality: 1 })]
        })
      } else {
        renderable.c.filters = [...renderable.filters, new OutlineFilter({ thickness, color, quality: 1 })]
      }
    },
    cleanup: () => {
      // remove from the renderer
      renderable.renderer?.app.stage.removeChild(renderable.c)
      renderable.renderer?.camera.remove(renderable)

      // remove all event listeners
      renderable.c.removeAllListeners()

      renderable.c.renderable = false
      renderable.visible = false

      // remove from the world
      // renderable.c.destroy() // TODO disabled because it breaks debug mode
    },
    _init: async (renderer: Renderer | undefined, world: World) => {
      if (!renderer) return
      renderable.renderer = renderer

      renderable.c = new Container()

      // add child container
      if (renderable.setContainer && renderer) renderable.c = await renderable.setContainer(renderer)

      // add children
      if (renderable.setChildren && renderer) {
        const childRenderables = await renderable.setChildren(renderer)
        renderable.children = childRenderables

        childRenderables.forEach(async (child) => {
          await child._init(renderer, world)
          renderable.c.addChild(child.c)
        })
      }

      if (renderable.setup) await renderable.setup(renderable, renderer, world)

      // set position
      renderable.c.position.set(renderable.position.x, renderable.position.y)

      // set interactive children
      renderable.c.interactiveChildren = renderable.interactiveChildren

      // set visible
      renderable.c.renderable = renderable.visible ?? true

      if (renderable.filters.length) renderable.c.filters = renderable.filters

      // set container properties
      renderable.c.zIndex = renderable.zIndex || 0
      renderable.c.sortableChildren = true
      renderable.c.alpha = 1

      // outline
      if (renderable.outline) renderable.setOutline()

      if (keys(renderable.animations).length) {
        renderable.prepareAnimations(renderable.animationColor, props.alpha ?? 1)
      } else {
        const c = renderable.c as Sprite | Graphics
        if (c.texture) {
          c.scale = props.scale ?? 1

          // @ts-expect-error
          if (c.anchor) c.anchor.set(renderable.anchor.x, renderable.anchor.y)

          // @ts-expect-error
          if (c.texture.source) c.texture.source.scaleMode = props.scaleMode ?? "nearest"
        }
      }
      renderable.initialized = true
    }
  }

  return renderable
}
