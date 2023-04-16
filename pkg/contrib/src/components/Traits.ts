import { Component } from "@piggo-legends/core";

export type Trait = "Assassin" | "Blademaster" | "Brawler" | "Demolitionist" | "Elementalist" | "Gunslinger" | "Knight" | "Mage" | "Mercenary" | "Ninja" | "Ranger" | "Shapeshifter" | "Sorcerer" | "Star Guardian" | "Valkyrie" | "Void" | "Yordle";

// the Traits component stores a unit's traits
export class Traits implements Component {
  traits: readonly [Trait?, Trait?, Trait?]

  constructor(traits: [Trait?, Trait?, Trait?]) {
    this.traits = traits;
  }
}
