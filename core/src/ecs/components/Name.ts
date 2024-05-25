import { Component } from "@piggo-gg/core";

export class Name extends Component<"name"> {
  type: "name" = "name";
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
