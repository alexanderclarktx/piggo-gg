import { Action, Controlling, Inventory, InvokedAction, Noob, Skelly, TeamColors, XY } from "@piggo-gg/core"

export const controlEntity: Action = Action(({ entity, player }) => {
  if (!entity || !player) return

  player.components.controlling = Controlling({ entityId: entity.id })
})

export const invokeSpawnSkelly = (player: Noob, color?: number, pos?: XY): InvokedAction => ({
  action: "spawnSkelly", playerId: player.id, params: { color, pos }
})

export const setActiveItemIndex = Action<{ index: number }>(({ params, entity }) => {
  if (params.index === null || params.index === undefined) return

  const inventory = entity?.components.inventory
  if (!inventory) return

  inventory.setActiveItemIndex(params.index)
})

export const spawnSkelly = Action<{ color: number, pos: XY }>(({ player, world, params }) => {
  if (!player) return

  if (player.components.controlling.getControlledEntity(world)) return

  const characterForPlayer = Skelly(player, params.color, params.pos)
  player.components.controlling = Controlling({ entityId: characterForPlayer.id })
  world.addEntity(characterForPlayer)
})

export const switchTeam = Action(({ entity, world }) => {
  if (!entity) return

  const { team, controlling } = entity.components
  if (!team) return

  team.switchTeam()

  const character = controlling?.getControlledEntity(world)
  if (character) {
    const { team, renderable } = character.components

    if (team) team.switchTeam()

    if (team && renderable) {
      renderable.prepareAnimations(TeamColors[team.data.team])
    }
  }
})
