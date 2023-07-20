import { Component } from "@piggo-legends/core";

export type Bounds = { x: number, y: number, w: number, h: number };

export type InteractiveProps = {
  width: number;
  height: number;
  active: boolean;
  onPress: string; // action ID
}

export class Interactive implements Component<"interactive"> {
  type: "interactive";

  width: number;
  height: number;
  active: boolean;
  onPress: string; // action ID

  constructor(props: InteractiveProps) {
    this.width = props.width;
    this.height = props.height;
    this.active = props.active;
    this.onPress = props.onPress;
  }
}
