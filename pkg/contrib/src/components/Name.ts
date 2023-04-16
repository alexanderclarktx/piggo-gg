import { Component } from "@piggo-legends/core";

export class Name implements Component {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
