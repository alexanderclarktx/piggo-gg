import { ClientSystemBuilder, D3Text, min, Player, VillagersSettings, VillagersState, World } from "@piggo-gg/core"
import { Group } from "three"

export type D3Nametag = {
  group: Group
  update: (world: World, delta: number) => void
}

export const D3Nametag = (player: Player): D3Nametag => {
  const group = new Group()
  const text = D3Text()

  group.add(text)

  return {
    group,
    update: (world: World, delta: number) => {
      const character = player.components.controlling.getCharacter(world)
      if (!character) return

      const pc = world.client?.character()
      if (pc) {
        if (pc.components.position.data.flying && !character.components.position.data.flying) {
          group.visible = false
        } else {
          group.visible = true
        }
      }

      const { position } = character.components
      const interpolated = position.interpolate(world, delta)

      group.position.set(interpolated.x, interpolated.z + 0.2, interpolated.y)

      // update text if needed
      const { name } = player.components.pc.data
      if (text.text !== name) {
        text.text = name
        text.sync()
      }

      // scale the size
      const dist = world.three?.camera.c.position.distanceTo(group.position) || 1
      const scale = 0.5 + min(5, dist * 0.5)
      group.scale.set(scale, scale, scale)

      // orient toward camera
      const camera = world.three?.camera.c
      if (camera) group.lookAt(camera.position)
    }
  }
}

export const D3NametagSystem = ClientSystemBuilder({
  id: "D3NametagSystem",
  init: (world) => {

    const nametags: Record<string, D3Nametag> = {}

    const settings = world.settings<VillagersSettings>()

    return {
      id: "D3NametagSystem",
      query: [],
      priority: 10,
      onTick: () => {
        if (!settings.showNametags) {
          for (const nametag of Object.values(nametags)) {
            nametag.group.visible = false
          }
          return
        } else {
          for (const nametag of Object.values(nametags)) {
            nametag.group.visible = true
          }
        }
      },
      onRender: (_, delta) => {
        if (!world.three) return

        if (!settings.showNametags) return

        const players = world.players()

        // cleanup old nametags
        for (const id in nametags) {
          if (!world.entity(id)) {
            const nametag = nametags[id]
            if (nametag) {
              world.three.scene.remove(nametag.group)
              delete nametags[id]
            }
          }
        }

        for (const player of players) {

          if (player.id === world.client?.playerId()) continue

          // new player
          if (!nametags[player.id]) {
            const nametag = D3Nametag(player)
            nametags[player.id] = nametag

            world.three.scene.add(nametag.group)
          }

          // update
          nametags[player.id]?.update(world, delta)
        }
      }
    }
  }
})
