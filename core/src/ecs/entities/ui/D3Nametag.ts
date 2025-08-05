import { Player, World } from "@piggo-gg/core"
import { Group } from "three"
import { Text } from "troika-three-text"

export type D3Nametag = {
  group: Group
  update: (world: World) => void
}

export const D3Nametag = (player: Player): D3Nametag => {
  const group = new Group()
  const text = new Text()

  let { name } = player.components.pc.data

  text.text = name
  text.fontSize = 0.3
  text.color = 0xffffff
  text.anchorX = "center"
  text.anchorY = "middle"
  text.sync()

  group.add(text)

  return {
    group,
    update: (world: World) => {
      const character = player.components.controlling.getCharacter(world)
      if (!character) return

      const { position } = character.components
      const interpolated = position.interpolate(world, performance.now() - world.time)

      group.position.set(interpolated.x, interpolated.z + 0.3, interpolated.y)
    }
  }
}
