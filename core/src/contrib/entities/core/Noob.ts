import { Controlling, Entity, Networked, Player } from "@piggo-legends/core";

export type NoobProps = {
  id: string
}

export const Noob = ({ id }: NoobProps): Entity => ({
  id: id,
  components: {
    networked: new Networked({ isNetworked: true }),
    player: new Player({ name: id }),
    controlling: new Controlling({ entityId: "" }),
  }
});
