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
    position: Position(),
    renderable: Renderable({
      zIndex: -2,
      interpolate: true,
      dynamic: ({ renderable }) => {
        const godRayFilter = renderable.filters["rays"] as GodrayFilter
        if (rays && godRayFilter) godRayFilter.time += 0.008

        const tile = renderable.c as TilingSprite
        if (moving) tile.tilePosition.x += 0.5
      },
      setup: async (renderable) => {
        if (rays) renderable.setRays({ gain: 0.45, alpha: 0.45, lacunarity: 2 })

        renderable.setBloom({ threshold: 0.5, bloomScale: 0.95 })

        let texture: Texture

        if (json) {
          const assets = await Assets.load(json.path)
          texture = assets.textures[json.img]
        } else {
          texture = Sprite.from(await Assets.load(img ?? "night.png")).texture
        }

        renderable.c = new TilingSprite({
          texture: texture,
          tilePosition: { x: 207, y: 117 },
          width: 6000,
          height: 6000
        })
      }
    })
  }
})
