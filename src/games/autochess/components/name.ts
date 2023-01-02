import { Component } from "../../shared/ecs";

export class Name extends Component {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
