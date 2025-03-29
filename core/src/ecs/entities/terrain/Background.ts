import { Collider, Entity, Position, Renderable } from "@piggo-gg/core"
import { Assets, Sprite, Texture, TilingSprite } from "pixi.js"
import { AdvancedBloomFilter, GodrayFilter } from "pixi-filters"

export type BackgroundProps = {
  img?: string
  json?: { path: string, img: string }
  rays?: boolean
  moving?: boolean
}

export const Background = ({ img, json, rays, moving }: BackgroundProps = {}) => Entity({
  id: "background",
  components: {
    position: Position({ x: 207, y: 117, velocity: { x: moving ? 8 : 0, y: 0 } }),
    collider: Collider({ sensor: () => false, shape: "ball", radius: 1 }),
    renderable: Renderable({
      zIndex: -2,
      interpolate: true,
      dynamic: ({ renderable, entity }) => {
        // @ts-expect-error
        if (rays) renderable.filters[0].time += 0.008

        // sync tilePosition with Position
        const { position } = entity.components
        const tile = renderable.c as TilingSprite
        tile.tilePosition.x = position.data.x
        tile.tilePosition.y = position.data.y
      },
      setup: async (renderable) => {
        if (rays) renderable.filters.push(
          new GodrayFilter({ gain: 0.5, alpha: 0.4, lacunarity: 2 })
        )

        renderable.filters.push(new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1 }))

        let texture: Texture

        if (json) {
          const assets = await Assets.load(json.path)
          texture = assets.textures[json.img]
        } else {
          texture = Sprite.from(await Assets.load(img ?? "night.png")).texture
        }

        renderable.c = new TilingSprite({ texture: texture, width: 6000, height: 6000 })
      }
    })
  }
})
