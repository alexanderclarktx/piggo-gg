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
    position: Position({ x: -2000, y: -2000, velocity: { x: moving ? 15 : 0, y: 0 } }),
    collider: Collider({ sensor: () => false, shape: "ball", radius: 1 }),
    renderable: Renderable({
      zIndex: -2,
      dynamic: ({ renderable }) => {
        // @ts-expect-error
        if (rays) renderable.filters[0].time += 0.008
      },
      interpolate: true,
      setup: async (renderable) => {
        if (rays) renderable.filters.push(
          new GodrayFilter({ gain: 0.4, alpha: 0.4, lacunarity: 2.5 })
        )

        renderable.filters.push(new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1 }))

        let texture: Texture

        if (json) {
          const assets = await Assets.load(json.path)
          texture = assets.textures[json.img]
        } else {
          texture = Sprite.from(await Assets.load(img ?? "night.png")).texture
        }

        renderable.c = new TilingSprite({ texture: texture, width: 12000, height: 12000 })
      }
    })
  }
})
