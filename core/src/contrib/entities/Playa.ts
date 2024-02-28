import { Controlling, Entity, Networked, Player } from "@piggo-legends/core";

export type PlayaProps = {
  id: string
}

export const Playa = ({ id }: PlayaProps): Entity => ({
  id: id,
  components: {
    networked: new Networked({ isNetworked: true }),
    player: new Player({ name: id }),
    controlling: new Controlling({ entityId: "" }),
  }
});
