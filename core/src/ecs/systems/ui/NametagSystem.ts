import {
  Character, ClientSystemBuilder, Entity, Player,
  Position, Renderable, entries, pixiText
} from "@piggo-gg/core"

export const NametagSystem = ClientSystemBuilder({
  id: "NametagSystem",
  init: (world) => {
    if (!world.renderer) return undefined

    const characterNametags: Record<string, Entity<Renderable | Position>> = {}

    return {
      id: "NametagSystem",
      query: ["pc"],
      skipOnRollback: true,
      onTick: (entities: Player[]) => {

        // clean up
        entries(characterNametags).forEach(([entityId, nametag]) => {
          if (!world.entities[entityId]) {
            world.removeEntity(nametag.id)
            delete characterNametags[entityId]
          }
        })

        // handle new entities
        entities.forEach((player) => {
          const character = player.components.controlling.getCharacter(world)
          if (!character) return

          const { renderable } = character.components

          // add nametag
          if (!characterNametags[player.id]) {
            const nametag = Nametag(player, character)
            characterNametags[player.id] = nametag
            world.addEntity(nametag)
          }

          // update visibility
          if (characterNametags[player.id] && renderable) {
            characterNametags[player.id].components.renderable.visible = renderable.visible
          }
        })
      }
    }
  }
})

const Nametag = (player: Player, character: Character) => {

  let { name } = player.components.pc.data

  const nametag = pixiText({
    text: name,
    style: { fill: 0xffff00, fontSize: 13 },
    anchor: { x: 0.48, y: 0 },
    pos: { x: 0, y: -45 }
  })

  return Entity<Position | Renderable>({
    id: `${player.id}-nametag`,
    components: {
      position: Position({ follows: character.id }),
      renderable: Renderable({
        zIndex: 10,
        interpolate: true,
        dynamic: async () => {
          if (player.components.pc.data.name !== name) {
            name = player.components.pc.data.name
            nametag.text = name
          }
        },
        setup: async (r) => {
          r.c.addChild(nametag)
        }
      })
    }
  })
}
