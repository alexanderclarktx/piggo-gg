import { Actions, Controlling, Entity, Networked, Player, Team, switchTeam, spawnSkelly, Money } from "@piggo-gg/core"

export type NoobProps = {
  id: string
}

export type Noob = Entity<Player | Controlling | Actions | Team | Money>

export const Noob = ({ id }: NoobProps): Noob => Entity({
  id: id,
  persists: true,
  components: {
    networked: Networked({ isNetworked: true }),
    player: Player({ name: id }),
    controlling: Controlling({ entityId: "" }),
    actions: Actions({ spawnSkelly, switchTeam }),
    team: Team(1),
    money: Money(1000)
  }
})
