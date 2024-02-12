import { Component } from "@piggo-legends/core";

export type Trait = "Assassin" | "Blademaster" | "Brawler" | "Demolitionist" | "Elementalist" | "Gunslinger" | "Knight" | "Mage" | "Mercenary" | "Ninja" | "Ranger" | "Shapeshifter" | "Sorcerer" | "Star Guardian" | "Valkyrie" | "Void" | "Yordle";

// the Traits component stores a unit's traits
export class Traits extends Component<"traits"> {
  type: "traits" = "traits";

  traits: readonly [Trait?, Trait?, Trait?];

  constructor(traits: [Trait?, Trait?, Trait?]) {
    super();
    this.traits = traits;
  }
}
