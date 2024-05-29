import { Component, SystemBuilder } from "@piggo-gg/core";

export type TeamNumber = 1 | 2;

export const TeamColors: Record<TeamNumber, number> = {
  1: 0x00ffff,
  2: 0xffcccc
}

export class Team extends Component<"team"> {
  type: "team" = "team";

  override data = {
    team: 1 as TeamNumber
  }

  switchTeam = () => {
    this.data.team = this.data.team === 1 ? 2 : 1;
  }

  constructor({ team }: { team: TeamNumber }) {
    super();
    this.data.team = team;
  }
}

export const TeamSystem: SystemBuilder<"TeamSystem"> = {
  id: "TeamSystem",
  init: () => {
    return {
      id: "TeamSystem",
      query: ["team"],
      onTick: (entities) => {
        entities.forEach((entity) => {
          const { team } = entity.components;
          console.log("Team", team);
        });
      }
    }
  }
}
