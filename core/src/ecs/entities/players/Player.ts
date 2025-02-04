import { Actions, Controlling, Entity, Networked, PC, Team, switchTeam, Money } from "@piggo-gg/core"

export type PlayerProps = {
  id: string
}

export type Player = Entity<PC | Controlling | Actions | Team>

export const Player = ({ id }: PlayerProps): Player => Entity({
  id: id,
  persists: true,
  components: {
    networked: Networked(),
    pc: PC({ name: id }),
    controlling: Controlling(),
    actions: Actions({ switchTeam }),
    team: Team(1)
  }
})
