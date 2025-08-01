import { Actions, Controlling, Entity, Networked, PC, Team, switchTeam } from "@piggo-gg/core"

export type PlayerProps = {
  id: string
  name?: string
}

export type Player = Entity<PC | Controlling | Actions | Team>

export const Player = ({ id, name }: PlayerProps): Player => Entity<PC | Controlling | Actions | Team>({
  id: id,
  persists: true,
  components: {
    networked: Networked(),
    pc: PC({ name: name ?? "noob" }),
    controlling: Controlling(),
    actions: Actions({ switchTeam }),
    team: Team(1)
  }
})
