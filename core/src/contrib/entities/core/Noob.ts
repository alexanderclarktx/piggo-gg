import { Action, Actions, Controlling, Entity, Networked, Player, Skelly } from "@piggo-gg/core";

export type NoobProps = {
  id: string
}

export const Noob = ({ id }: NoobProps) => Entity<Player | Controlling>({
  id: id,
  persists: true,
  components: {
    networked: new Networked({ isNetworked: true }),
    player: new Player({ name: id }),
    controlling: new Controlling({ entityId: "" }),
    actions: new Actions({
      "spawnSkelly": Action<{ color: number }>(({ player, world, params }) => {
        if (!player) return;

        const characterForPlayer = Skelly(`skelly-${player.id}`, params.color);
        player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
        world.addEntity(characterForPlayer);
      })
    })
  }
});
