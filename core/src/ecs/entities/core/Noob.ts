import { Actions, Controlling, Entity, Networked, Player, Team, changeTeam, spawnSkelly } from "@piggo-gg/core";

export type NoobProps = {
  id: string
}

export type Noob = Entity<Player | Controlling | Actions | Team>

export const Noob = ({ id }: NoobProps): Noob => Entity({
  id: id,
  persists: true,
  components: {
    networked: new Networked({ isNetworked: true }),
    player: new Player({ name: id }),
    controlling: new Controlling({ entityId: "" }),
    actions: new Actions({ spawnSkelly, changeTeam }),
    team: new Team({ team: 1 })
  }
});
