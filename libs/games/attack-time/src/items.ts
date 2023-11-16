import { Statline } from "./stats";

// Item is equippable by a Unit
export class Item {
  name: string;
  statBuff: Statline;
  // effect?: Effect;

  constructor(name: string, statBuff: Statline = "0-0-0-0-0-0-0-0") {
    this.name = name;
    this.statBuff = statBuff;
  }
}

// basic items that can be combined
export const basicItems = {
  belt: new Item("Belt", "0-0-0-100-0-0-0-0"),
  bow: new Item("Bow", "0-0-0.1-0-0-0-0-0"),
  cloak: new Item("Cloak", "0-0-0-0-0-0-10-0"),
  cloth: new Item("Cloth", "0-0-0-0-0-10-0-0"),
  sword: new Item("Sword", "10-0-0-0-0-0-0-0"),
  glove: new Item("Glove", "0-0-0-10-0-0-0-0"),
  rod: new Item("Rod", "0-10-0-0-0-0-0-0"),
  spatula: new Item("Spatula", "0-0-0-0-0-0-0-0"),
  tear: new Item("Tear", "0-0-0-0-0-0-0-10")
}

// basic items and combined items
export const items = {
  ...basicItems,
  InfinityEdge: new Item("Infinity Edge", "100-0-0-0-0-0-0-0"),
}
