import {
  Character, ClientSystemBuilder, Entity, Player,
  Position, Renderable, entries, pixiText
} from "@piggo-gg/core"

export const NametagSystem = ClientSystemBuilder({
  id: "NametagSystem",
  init: (world) => {

    const nametags: Record<string, Entity<Renderable | Position>> = {}

    return {
      id: "NametagSystem",
      query: ["pc"],
      priority: 6,
      skipOnRollback: true,
      onTick: (entities: Player[]) => {

        // clean up
        for (const [entityId, nametag] of entries(nametags)) {

          if (!world.entity(nametag.id)) {
            delete nametags[entityId]
          }

          if (!world.entity(entityId)) {
            world.removeEntity(nametag.id)
            delete nametags[entityId]
          }
        }

        // new players
        for (const player of entities) {
          const character = player.components.controlling.getCharacter(world)
          if (!character) continue

          if (!nametags[player.id]) {
            const nametag = Nametag(player, character)
            nametags[player.id] = nametag
            world.addEntity(nametag)
          }
        }
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
    id: `nametag-${player.id}`,
    components: {
      position: Position({ follows: character.id }),
      renderable: Renderable({
        zIndex: 10,
        interpolate: true,
        dynamic: async ({ renderable }) => {
          renderable.visible = character.components.renderable.visible

          // update nametag text
          if (player.components.pc.data.name !== name) {
            name = player.components.pc.data.name
            nametag.text = name
          }
        },
        setContainer: async () => nametag
      })
    }
  })
}
