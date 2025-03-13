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
      console.log("switch", team.data.team)
      team.data.team = team.data.team === 1 ? 2 : 1
      console.log("switch", team.data.team)
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
