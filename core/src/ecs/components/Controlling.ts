import { Actions, Collider, Component, Entity, Input, Player, Position, SystemBuilder, Team, World } from "@piggo-gg/core"

export type Character = Entity<Position | Collider | Input | Actions | Team>
export const Character = Entity<Position | Collider | Input | Actions | Team>

export type Controlling = Component<"controlling", { entityId: string }> & {
  getCharacter: (world: World) => Character | undefined
}

export type ControllingProps = {
  entityId?: string
}

export const playerForCharacter = (world: World, characterId: string): Player | undefined => {
  const players = world.players()
  for (const player of players) {
    const controlling = player.components.controlling.getCharacter(world)
    if (controlling && characterId === controlling?.id) {
      return player
    }
  }
  return undefined
}

export const Controlling = (props: ControllingProps = {}): Controlling => {
  const controlling: Controlling = {
    type: "controlling",
    data: {
      entityId: props.entityId ?? ""
    },
    getCharacter: (world: World) => {
      const character = world.entity(controlling.data.entityId)
      if (!character) return undefined

      const { position, input, actions } = character.components
      if (!position || !input || !actions) return undefined

      return character as Character
    }
  }
  return controlling
}

export const ControlSystem = SystemBuilder({
  id: "ControlSystem",
  init: (world) => ({
    id: "ControlSystem",
    query: ["controlling"],
    priority: 2,
    onTick: (entities: Entity<Controlling>[]) => {
      for (const entity of entities) {
        const character = entity.components.controlling.getCharacter(world)

        if (!character) entity.components.controlling.data.entityId = ""
      }
    }
  })
})
