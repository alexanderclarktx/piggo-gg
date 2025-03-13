import { Action, Controlling, TeamColors } from "@piggo-gg/core"

export const controlEntity: Action = Action("controlEntity", ({ entity, player }) => {
  if (!entity || !player) return

  player.components.controlling = Controlling({ entityId: entity.id })
})

export const switchTeam = Action("switchTeam", ({ entity, world }) => {
  if (!entity) return

  const { team, controlling } = entity.components
  if (!team) return

  team.switchTeam()

  console.log("switched team", team.data.team)

  const character = controlling?.getCharacter(world)
  if (character) {
    const { team, renderable } = character.components

    if (team) team.switchTeam()

    if (team && renderable) {
      renderable.prepareAnimations(TeamColors[team.data.team])
    }
  }
}, 20)
