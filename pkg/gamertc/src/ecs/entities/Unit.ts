import { Entity, EntityProps, Health } from "@piggo-legends/gamertc";
import { Equipment } from "../components/Equipment";
import { Tier } from "../components/Tier";
import { Traits } from "../components/Traits";
import { Name } from "../components/Name";

export type UnitProps = EntityProps & {
  health: Health,
  equipment: Equipment,
  traits: Traits,
  tier: Tier
}

// a Unit can be placed on the board
export class Unit extends Entity<UnitProps> {
  health: Health;
  equipment: Equipment;
  traits: Traits;
  tier: Tier;

  constructor (props: UnitProps) {
    super({
      ...props,
      name: props.name || new Name("unit")
    });
  }
}
