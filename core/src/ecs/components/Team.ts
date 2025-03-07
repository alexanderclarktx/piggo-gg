import { Component, SystemBuilder } from "@piggo-gg/core"

export type TeamNumber = 1 | 2

export const TeamColors: Record<TeamNumber, number> = {
  1: 0xff7777,
  2: 0x00ccff
}

export type Team = Component<"team", { team: TeamNumber }> & {
  switchTeam: () => void
  visible: boolean // visible to the other team
}

export const Team = (teamNumber: TeamNumber): Team => {
  const team: Team = {
    type: "team",
    data: { team: teamNumber },
    switchTeam: () => {
      team.data.team = team.data.team === 1 ? 2 : 1
    },
    visible: false
  }
  return team
}

export const TeamSystem: SystemBuilder<"TeamSystem"> = {
  id: "TeamSystem",
  init: () => {
    return {
      id: "TeamSystem",
      query: ["team"],
      priority: 5, // todo
      onTick: (entities) => {
        entities.forEach((entity) => {
          const { team } = entity.components
          console.log("Team", team)
        })
      }
    }
  }
}
