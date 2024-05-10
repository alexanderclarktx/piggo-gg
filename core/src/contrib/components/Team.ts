import { Component, SystemBuilder } from "@piggo-gg/core";

export class Team extends Component<"team"> {
  type: "team" = "team";

  override data = {
    team: 0
  }

  constructor({ team }: { team: number }) {
    super();
    this.data.team = team;
  }
}

export const TeamSystem: SystemBuilder<"TeamSystem"> = {
  id: "TeamSystem",
  init: ({ world }) => {
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
