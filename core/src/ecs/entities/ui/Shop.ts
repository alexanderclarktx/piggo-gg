import {
  Actions, Button, Character, Clickable, Entity, GunNames, GunsTable, Input, Position,
  PositionProps, Renderable, TwoPoints, World, isMobile, loadTexture, pixiGraphics, pixiText
} from "@piggo-gg/core"
import { ScrollBox } from "@pixi/ui"
import { OutlineFilter } from "pixi-filters"
import { Container, Sprite } from "pixi.js"

export const ShopButton = (pos: PositionProps = { x: -55, y: 5, screenFixed: true }) => Entity({
  id: "shopButton",
  components: {
    position: Position(pos),
    clickable: Clickable({
      width: 45, height: 32,
      click: () => ({ actionId: "toggleVisible", entityId: "shop", offline: true })
    }),
    renderable: Button({
      dims: { w: 50, textX: 8, textY: 5 },
      zIndex: 10,
      text: pixiText({ text: "shop", style: { fill: 0xffffff, fontSize: 16 } })
    })
  }
})

export const Shop = (): Entity => {

  let visible = false
  const mobile = isMobile()

  const shop = Entity<Position | Renderable>({
    id: "shop",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      input: Input({
        press: {
          "b": ({ world }) => ({ actionId: "toggleVisible", playerId: world.client?.playerId(), offline: true })
        }
      }),
      actions: Actions({
        toggleVisible: () => {
          visible = !visible
          shop.components.renderable.visible = visible
        },
        buyItem: ({ world, params, player }) => {
          if (!params.itemBuilder) return

          const builder = GunsTable[params.itemBuilder as GunNames]
          const character = player?.components.controlling.getCharacter(world) as Character
          if (!builder || !character) return

          const item = builder({ character })
          world.addEntity(item)
          character.components.inventory?.addItem(item, world)
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

          const deagle = await Cell("Deagle", width, height, world, mobile)
          const ak = await Cell("AK", width, height, world, mobile)
          const awp = await Cell("AWP", width, height, world, mobile)

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

const Cell = async (text: string, width: number, height: number, world: World, mobile: boolean): Promise<Container> => {
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
    const builder = GunsTable[text.toLowerCase() as GunNames]
    if (!builder || !character) return

    world.client?.clickThisFrame.set(world.tick + 1)

    world.actions.push(world.tick + 2, "shop", {
      actionId: "buyItem", params: { itemBuilder: text.toLowerCase() }, playerId: world.client?.playerId()
    })

    // TODO this is global
    world.actions.push(world.tick + 1, "shop", { actionId: "toggleVisible", playerId: world.client?.playerId() })
  }
  c.onmouseenter = () => dark.visible = true
  c.onmouseleave = () => dark.visible = false

  return c
}
