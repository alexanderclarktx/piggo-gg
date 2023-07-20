import { Component } from "@piggo-legends/core";

export type PlayerProps = {
  name: string
}

export class Player implements Component<"player"> {
  type: "player";

  name: string;

  constructor(props: PlayerProps) {
    this.name = props.name
  }

}
