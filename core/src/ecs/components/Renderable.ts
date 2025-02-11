import { Component, Entity, Renderer, World, XY, keys, values } from "@piggo-gg/core"
import { OutlineFilter } from "pixi-filters"
import { AnimatedSprite, Container, Graphics, Sprite } from "pixi.js"

export type Renderable = Component<"renderable"> & {
  activeAnimation: string
  anchor: { x: number, y: number }
  animation: AnimatedSprite | undefined
  animations: Record<string, AnimatedSprite>
  bufferedAnimation: string
  c: Container
  children: Renderable[] | undefined
  cullable: boolean
  animationColor: number
  color: number
  interactiveChildren: boolean
  interpolate: boolean
  initialized: boolean
  position: { x: number, y: number }
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
  dynamic: ((_: { container: Container, renderable: Renderable, entity: Entity, world: World }) => void) | undefined

  prepareAnimations: (color?: number) => void
  setScale: (xy: XY) => void
  _init: (renderer: Renderer | undefined, world: World) => Promise<void>
  setAnimation: (animationKey: string) => void
  setOutline: (_?: { color: number, thickness: number }) => void
  cleanup: () => void
}

export type RenderableProps = {
  anchor?: XY
  animations?: Record<string, AnimatedSprite>
  cacheAsBitmap?: boolean
  color?: number
  cullable?: boolean
  animationColor?: number
  interactiveChildren?: boolean
  interpolate?: boolean
  position?: { x: number, y: number }
  rotates?: boolean
  outline?: { color: number, thickness: number }
  scale?: number
  scaleMode?: "nearest" | "linear"
  visible?: boolean
  zIndex?: number
  dynamic?: (_: { container: Container, renderable: Renderable, entity: Entity, world: World }) => void
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
    bufferedAnimation: "",
    c: new Container(),
    r: undefined,
    color: props.color ?? 0xffffff,
    children: undefined,
    cullable: props.cullable ?? false,
    dynamic: props.dynamic,
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

    prepareAnimations: (color: number = 0xffffff) => {
      values(renderable.animations).forEach((animation: AnimatedSprite) => {
        animation.animationSpeed = 0.1
        animation.scale.set(renderable.scale)
        animation.anchor.set(renderable.anchor.x, renderable.anchor.y)
        animation.texture.source.scaleMode = renderable.scaleMode
        animation.tint = color
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
    setOutline: (props?: { color: number, thickness: number }) => {
      const { thickness, color } = props ?? renderable.outline
      if (keys(renderable.animations).length) {
        values(renderable.animations).forEach((animation) => {
          animation.filters = [new OutlineFilter({ thickness, color })]
        })
      } else {
        renderable.c.filters = [new OutlineFilter({ thickness, color })]
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

      // set container properties
      renderable.c.zIndex = renderable.zIndex || 0
      renderable.c.sortableChildren = true
      renderable.c.alpha = 1

      // outline
      if (renderable.outline) renderable.setOutline()

      if (keys(renderable.animations).length) {
        renderable.prepareAnimations(renderable.animationColor)
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
