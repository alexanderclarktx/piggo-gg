import { Action, Controlling, Skelly, TeamColors, XY } from "@piggo-gg/core"

export const controlEntity: Action = Action("controlEntity", ({ entity, player }) => {
  if (!entity || !player) return

  player.components.controlling = Controlling({ entityId: entity.id })
})

export const spawnSkelly = Action<{ color: number, pos: XY }>(
  "spawnSkelly",
  ({ player, world, params }) => {
    if (!player) return

    if (player.components.controlling.getControlledEntity(world)) return

    const characterForPlayer = Skelly(player, params.color, params.pos)
    player.components.controlling = Controlling({ entityId: characterForPlayer.id })
    world.addEntity(characterForPlayer)
  }
)

export const switchTeam = Action("switchTeam", ({ entity, world }) => {
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
