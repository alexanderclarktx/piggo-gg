import { Actions, Controlling, Entity, Networked, Player, Team, switchTeam, spawnSkelly, Wallet } from "@piggo-gg/core";

export type NoobProps = {
  id: string
}

export type Noob = Entity<Player | Controlling | Actions | Team | Wallet>

export const Noob = ({ id }: NoobProps): Noob => Entity({
  id: id,
  persists: true,
  components: {
    networked: Networked({ isNetworked: true }),
    player: Player({ name: id }),
    controlling: Controlling({ entityId: "" }),
    actions: Actions({ spawnSkelly, switchTeam }),
    team: Team(1),
    wallet: Wallet(1000)
  }
});
