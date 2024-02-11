import { Component } from "@piggo-legends/core";

export type PlayerProps = { name: string };

export class Player extends Component<"player"> {
  // type: "player";

  name: string;

  constructor(props: PlayerProps) {
    super();
    this.name = props.name
  }
}
