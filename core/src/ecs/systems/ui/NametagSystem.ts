import { ClientSystemBuilder, Entity, Noob, Position, Renderable, entries, pixiText } from "@piggo-gg/core"

const Nametag = (entity: Noob): Renderable => {
  let name = entity.components.player.data.name

  const nametag = pixiText({
    text: name,
    style: { fill: 0xffff00, fontSize: 13 },
    anchor: { x: 0.48, y: 0 },
    pos: { x: 0, y: -45 }
  })

  return Renderable({
    zIndex: 10,
    interpolate: true,
    dynamic: async () => {
      if (entity.components.player.data.name !== name) {
        name = entity.components.player.data.name
        nametag.text = name
      }
    },
    setup: async (r) => {
      r.c.addChild(nametag)
    }
  })
}

// NameTagSystem displays character nametags
export const NametagSystem = ClientSystemBuilder({
  id: "NametagSystem",
  init: (world) => {
    if (!world.renderer) return undefined

    const characterNametags: Record<string, Entity<Renderable | Position>> = {}

    const nametagForEntity = (player: Noob, character: Entity) => {
      const { position } = character.components
      if (!position) return

      const nametag = Entity<Position | Renderable>({
        id: `${player.id}-nametag`,
        components: {
          position: position, // TODO should not directly use the character position component (gravity bug)
          renderable: Nametag(player)
        }
      })

      characterNametags[player.id] = nametag
      world.addEntity(nametag)
    }

    return {
      id: "NametagSystem",
      query: ["player"],
      skipOnRollback: true,
      onTick: (entities: Noob[]) => {

        // handle old entities
        entries(characterNametags).forEach(([entityId, nametag]) => {
          if (!world.entities[entityId]) {
            world.removeEntity(nametag.id)
            delete characterNametags[entityId]
          }
        })

        // handle new entities
        entities.forEach((entity) => {
          const character = entity.components.controlling.getControlledEntity(world)
          if (!character) return

          const { position, renderable } = character.components

          // new nametag
          if (!characterNametags[entity.id] || position !== characterNametags[entity.id].components.position) {
            nametagForEntity(entity, character)
          }

          // update visibility
          if (characterNametags[entity.id] && renderable) {
            characterNametags[entity.id].components.renderable.visible = renderable.visible
          }
        })
      }
    }
  }
})
