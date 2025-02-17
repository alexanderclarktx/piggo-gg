import {
  Actions, Entity, GunNames, GunsTable, Input, Position, Renderable, TwoPoints, World,
  clickableClickedThisFrame, isMobile, loadTexture, pixiGraphics, pixiText
} from "@piggo-gg/core"
import { ScrollBox } from "@pixi/ui"
import { OutlineFilter } from "pixi-filters"
import { Container, Sprite } from "pixi.js"

export const Shop = (): Entity => {

  let visible = false
  const mobile = isMobile()

  const shop = Entity<Position | Renderable>({
    id: "shop",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      input: Input({
        press: { "b": ({ world }) => ({ actionId: "toggleVisible", playerId: world.client?.playerId() }) }
      }),
      actions: Actions({
        toggleVisible: () => {
          visible = !visible
          shop.components.renderable.visible = visible
        }
      }),
      renderable: Renderable({
        zIndex: 11,
        visible: false,
        interactiveChildren: true,
        setup: async (renderable, renderer, world) => {
          const { width, height } = renderer.app.screen

          const background = pixiGraphics()
          const outline = pixiGraphics()

          const coords: TwoPoints = [width / 6, height / 4, width / 1.5, height / 2]

          background.rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0.5 })
          outline.roundRect(...coords).stroke({ color: 0xffffff, alpha: 1, width: 2 })

          const deagle = await cell("Deagle", width, height, world, mobile)
          const ak = await cell("AK", width, height, world, mobile)
          const awp = await cell("AWP", width, height, world, mobile)

          const box = new ScrollBox({ width, height, type: mobile ? "vertical" : "horizontal", elementsMargin: 20 })
          box.addItem(deagle, ak, awp)

          mobile ?
            box.position.set(coords[0] + width / 12, coords[1] - height / 20) :
            box.position.set(coords[0] + width / 16, coords[1] + height / 12)

          renderable.c.addChild(background, outline, box)
        }
      })
    }
  })

  return shop
}

const cell = async (text: string, width: number, height: number, world: World, mobile: boolean): Promise<Container> => {
  const c = new Container()
  c.interactiveChildren = true

  const coords: TwoPoints = mobile ?
    [0, height / 12, width / 2, height / 8] :
    [0, height / 24, width / 6, height / 4]

  const light = pixiGraphics().roundRect(...coords).fill({ color: 0xffffff, alpha: 0.2 })
  const dark = pixiGraphics({ visible: false }).roundRect(...coords).fill({ color: 0x000000, alpha: 0.5 })
  const outline = pixiGraphics().roundRect(...coords).stroke({ color: 0xffffff, alpha: 1, width: 2 })

  const textures = await loadTexture(`${text.toLowerCase()}.json`)
  const decal = new Sprite({
    texture: textures["0"],
    anchor: { x: 0.5, y: 0.5 },
    position: mobile ? { x: width / 4, y: height / 6 } : { x: width / 12, y: height / 6 },
    scale: 7,
  })
  decal.texture.source.scaleMode = "nearest"
  decal.filters = new OutlineFilter({ thickness: 2, color: 0xffffff, knockout: true })

  const name = pixiText({
    text,
    style: { fill: 0xffffff, fontSize: 20 },
    pos: mobile ? { x: width / 4, y: height / 9 } : { x: width / 12, y: height / 4 },
    anchor: { x: 0.5, y: 0.5 }
  })

  c.addChild(light, dark, outline, name, decal)

  c.onpointerdown = () => {
    const character = world.client?.playerCharacter()
    if (!character) return

    const newGun = GunsTable[text.toLowerCase() as GunNames]
    if (!newGun) return

    character.components
    character.components.inventory?.addItem(newGun({ character }))

    clickableClickedThisFrame.set(world.tick + 1)

    world.actionBuffer.push(world.tick + 1, "shop", { actionId: "toggleVisible", playerId: world.client?.playerId() })
  }
  c.onmouseenter = () => dark.visible = true
  c.onmouseleave = () => dark.visible = false

  return c
}
