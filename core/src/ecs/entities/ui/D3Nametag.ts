import { max, min, Player, sqrt, SystemBuilder, World } from "@piggo-gg/core"
import { Group } from "three"
import { Text } from "troika-three-text"

export type D3Nametag = {
  group: Group
  update: (world: World, delta: number) => void
}

export const D3Nametag = (player: Player): D3Nametag => {
  const group = new Group()
  const text = new Text()

  // text.text = ""
  text.fontSize = 0.05
  // text.font = "https://fonts.gstatic.com/s/comfortaa/v12/1Ptsg8LJRfWJmhDAuUs4TYFs.woff"
  // text.font = "https://fonts.gstatic.com/s/cutivemono/v6/m8JWjfRfY7WVjVi2E-K9H6RCTmg.woff"
  // text.font = "https://fonts.gstatic.com/s/gabriela/v6/qkBWXvsO6sreR8E-b8m5xL0.woff"
  // text.font = "https://fonts.gstatic.com/s/monoton/v9/5h1aiZUrOngCibe4fkU.woff"
  text.font = "https://fonts.gstatic.com/s/courierprime/v9/u-450q2lgwslOqpF_6gQ8kELWwZjW-_-tvg.ttf"
  text.color = 0xffffff
  text.outlineWidth = 0.001
  text.anchorX = "center"
  text.anchorY = "middle"
  text.sync()

  group.add(text)

  return {
    group,
    update: (world: World, delta: number) => {
      const character = player.components.controlling.getCharacter(world)
      if (!character) return

      const { position } = character.components
      const interpolated = position.interpolate(world, delta)

      group.position.set(interpolated.x, interpolated.z + 0.2, interpolated.y)

      // update text if needed
      const { name } = player.components.pc.data
      if (text.text !== name) {
        text.text = name
        text.sync()
      }

      // scale the size slightly
      const dist = world.three?.camera.c.position.distanceTo(group.position) || 1
      const scale = 0.5 + min(5, dist * 0.5)
      console.log(scale)
      group.scale.set(scale, scale, scale)

      // orient toward camera
      const camera = world.three?.camera.c
      if (camera) {
        group.lookAt(camera.position)
      }
    }
  }
}

export const D3NametagSystem = SystemBuilder({
  id: "D3NametagSystem",
  init: (world) => {

    const nametags: Record<string, D3Nametag> = {}

    return {
      id: "D3NametagSystem",
      query: [],
      priority: 10,
      onRender: (_, delta) => {
        if (!world.three) return

        const players = world.players()

        for (const player of players) {

          if (player.id === world.client?.playerId()) continue

          // new player
          if (!nametags[player.id]) {
            const nametag = D3Nametag(player)
            nametags[player.id] = nametag
            world.three.scene.add(nametag.group)
          }

          // update position
          const nametag = nametags[player.id]
          if (nametag) {
            nametag.update(world, delta)
            console.log("Nametag updated for player:", player.id)
          }
        }
      }
    }
  }
})
