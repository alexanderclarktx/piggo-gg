import { Component } from "@piggo-legends/core";

export type Bounds = { x: number, y: number, w: number, h: number };

export type ClickableProps = {
  width: number;
  height: number;
  active: boolean;
}

export class Clickable extends Component<"clickable"> {
  type: "clickable" = "clickable";
  width: number;
  height: number;
  active: boolean;

  constructor(props: ClickableProps) {
    super();
    this.width = props.width;
    this.height = props.height;
    this.active = props.active;
  }
}
