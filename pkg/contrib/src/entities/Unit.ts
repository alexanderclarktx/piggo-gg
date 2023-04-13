import { Entity, EntityProps } from "@piggo-legends/core";
import { Tier, Health, Traits } from "@piggo-legends/contrib";

export type UnitProps = EntityProps & {
  health: Health,
  traits: Traits,
  tier: Tier
}

// a Unit can be placed on the board
export class Unit extends Entity<UnitProps> {
  constructor (props: UnitProps) {
    super(props);
  }
}
