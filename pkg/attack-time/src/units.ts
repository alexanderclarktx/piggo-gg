import { Equipment } from "./components/equipment";
import { Health } from "./components/health";
import { Name } from "./components/name";
import { Tier } from "./components/tier";
import { Traits } from "./components/traits";
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
