import { Component } from "@piggo-legends/core";

export class Name extends Component<"name"> {
  // type: "name";

  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
