import { Controlling, Entity, Networked, Player } from "@piggo-gg/core";

export type NoobProps = {
  id: string
}

export const Noob = ({ id }: NoobProps) => Entity({
  id: id,
  persists: true,
  components: {
    networked: new Networked({ isNetworked: true }),
    player: new Player({ name: id }),
    controlling: new Controlling({ entityId: "" }),
  }
});
