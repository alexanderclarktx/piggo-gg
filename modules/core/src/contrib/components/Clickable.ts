import { Component } from "@piggo-legends/core";

export type Bounds = { x: number, y: number, w: number, h: number };

export type ClickableProps = {
  width: number;
  height: number;
  active: boolean;
  onPress: string; // action ID
}

export class Clickable extends Component<"clickable"> {
  // type: "clickable";

  width: number;
  height: number;
  active: boolean;
  onPress: string; // action ID

  constructor(props: ClickableProps) {
    super();
    this.width = props.width;
    this.height = props.height;
    this.active = props.active;
    this.onPress = props.onPress;
  }
}
