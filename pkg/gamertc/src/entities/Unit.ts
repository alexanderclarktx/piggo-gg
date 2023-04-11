import { Entity, EntityProps, Health } from "@piggo-legends/gamertc";
import { Tier } from "../components/Tier";
import { Traits } from "../components/Traits";

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
