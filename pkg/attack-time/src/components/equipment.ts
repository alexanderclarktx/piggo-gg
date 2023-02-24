import { Component } from "@piggo-legends/ecstacy";
import { Item } from "../../items";

// the Equipment component stores a unit's items
export class Equipment extends Component {
  items: readonly [Item?, Item?, Item?]
  constructor(items: [Item?, Item?, Item?]) {
    super();
    this.items = items;
  }
}
