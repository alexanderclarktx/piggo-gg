import { Equipment } from "./src/components/equipment";
import { Health } from "./src/components/health";
import { Name } from "./src/components/name";
import { Tier } from "./src/components/tier";
import { Traits } from "./src/components/traits";
import { Unit } from "./entities/unit";

export const units = {
  missFortune: new Unit(
    new Name("Miss Fortune"),
    new Health(100, 100),
    new Equipment([]),
    new Traits([]),
    new Tier(1)
  ),
  sivir: new Unit(
    new Name("Sivir"),
    new Health(100, 100),
    new Equipment([]),
    new Traits([]),
    new Tier(1)
  ),
  vayne: new Unit(
    new Name("Vayne"),
    new Health(100, 100),
    new Equipment([]),
    new Traits([]),
    new Tier(1)
  ),
  jinx: new Unit(
    new Name("Jinx"),
    new Health(100, 100),
    new Equipment([]),
    new Traits([]),
    new Tier(1)
  )
}
