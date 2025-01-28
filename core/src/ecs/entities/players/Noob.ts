import { Actions, Controlling, Entity, Networked, Player, Team, switchTeam, Money } from "@piggo-gg/core"

export type NoobProps = {
  id: string
}

export type Noob = Entity<Player | Controlling | Actions | Team | Money>

export const Noob = ({ id }: NoobProps): Noob => Entity({
  id: id,
  persists: true,
  components: {
    networked: Networked(),
    player: Player({ name: id }),
    controlling: Controlling({ entityId: "" }),
    actions: Actions({ switchTeam }),
    team: Team(1),
    money: Money(1000)
  }
})
