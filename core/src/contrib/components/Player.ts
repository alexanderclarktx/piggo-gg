import { Component } from "@piggo-gg/core";

export type PlayerProps = { name: string };

export class Player extends Component<"player"> {
  type: "player" = "player";
  name: string;

  constructor(props: PlayerProps) {
    super();
    this.name = props.name
  }
}
