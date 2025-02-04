import { SystemBuilder, isometricToWorld, round, searchVisibleTiles, tileIndex } from "@piggo-gg/core"
import { Container } from "pixi.js"

export const FogSystem: SystemBuilder<"FogSystem"> = {
  id: "FogSystem",
  init: (world) => {
    const { client, entities, tileMap } = world

    if (!tileMap) return undefined

    let last: { tint: number, container: Container }[] = []

    return {
      id: "FogSystem",
      query: [],
      onTick: () => {
        if (!client) return

        const floorTilesArray = entities["floorTilesArray"]
        if (!floorTilesArray) return

        const { player } = client
        const character = player.components.controlling.getControlledEntity(world)
        if (!character) return

        const { x, y } = isometricToWorld(character.components.position.data)

        const tileX = round(x / 32) - 1
        const tileY = round(y / 32)

        const index = tileIndex(tileY * 80 + tileX, tileMap)
        const child = floorTilesArray.components.renderable?.c.children[index]
        if (!child) return

        const visibleTiles: Container[] = [child]

        last.forEach(({ container, tint }) => container.tint = tint)
        last = []

        visibleTiles.push(...searchVisibleTiles({ x: tileX, y: tileY }, floorTilesArray, tileMap))

        visibleTiles.forEach((tile) => {
          last.push({ container: tile, tint: tile.tint })
        })

        visibleTiles.forEach((tile) => {
          if (tile && tile.tint === 0x7777aa) tile.tint = 0x8888cc
        })
      }
    }
  }
}
