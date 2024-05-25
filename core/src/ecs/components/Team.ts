import { Component, SystemBuilder } from "@piggo-gg/core";

export type TeamNumber = 1 | 2;

export class Team extends Component<"team"> {
  type: "team" = "team";

  override data = {
    team: 1 as TeamNumber
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
