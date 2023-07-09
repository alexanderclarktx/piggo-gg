import { Component } from "@piggo-legends/core";

export class Name implements Component<"name"> {
  name: string;
  type: "name";

  constructor(name: string) {
    this.name = name;
  }
}
