import { Entity, EntityProps,  } from "@piggo-legends/core";
import { Experience, Health, Gold } from "@piggo-legends/contrib";

export type PlayerProps = EntityProps & {
  gold: Gold,
  experience: Experience,
  health: Health
}

export class Player extends Entity<PlayerProps> {
  constructor(props: PlayerProps) {
    super(props);
  }
}
