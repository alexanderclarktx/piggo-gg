import { Component, SystemBuilder } from "@piggo-gg/core"

export type TeamNumber = 1 | 2

export const TeamColors: Record<TeamNumber, number> = {
  1: 0xffaacc,
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
      team.data.team = 1 + team.data.team % 2 as TeamNumber
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
      priority: 5,
      onTick: (entities) => {
        entities.forEach((entity) => {
          const { team } = entity.components
          console.log("Team", team)
        })
      }
    }
  }
}
