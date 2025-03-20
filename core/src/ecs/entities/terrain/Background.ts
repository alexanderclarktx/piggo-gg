import { Entity, Position, Renderable } from "@piggo-gg/core"
import { Assets, Sprite, Texture, TilingSprite } from "pixi.js"
import { GodrayFilter } from "pixi-filters"

export type BackgroundProps = {
  img?: string
  json?: { path: string, img: string }
  rays?: boolean
  moving?: boolean
}

export const Background = ({ img, json, rays, moving }: BackgroundProps = {}) => Entity({
  id: "background",
  components: {
    position: Position({ x: -2000, y: -2000 }),
    renderable: Renderable({
      zIndex: -2,
      dynamic: ({ entity, renderable }) => {
        // @ts-expect-error
        if (rays) renderable.filters[0].time += 0.008
        if (moving) entity.components.position.data.x += 0.5
      },
      filters: rays ? [new GodrayFilter({ gain: 0.4, alpha: 0.6, lacunarity: 2.5 })] : [],
      interpolate: true,
      setContainer: async () => {
        let texture: Texture

        if (json) {
          const assets = await Assets.load(json.path)
          texture = assets.textures[json.img]
        } else {
          texture = Sprite.from(await Assets.load(img ?? "night.png")).texture
        }

        return new TilingSprite({ texture: texture, width: 12000, height: 12000 })
      }
    })
  }
})
