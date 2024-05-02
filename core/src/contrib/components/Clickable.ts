import { Action, Component } from "@piggo-gg/core";

export type Bounds = { x: number, y: number, w: number, h: number };

export type ClickableProps = {
  width: number
  height: number
  active: boolean
  click?: Action<{}>
  hoverOver?: () => void
  hoverOut?: () => void
}

export class Clickable extends Component<"clickable"> {
  type: "clickable" = "clickable"
  width: number
  height: number
  active: boolean
  click: Action<{}> | undefined
  hoverOver: (() => void) | undefined
  hoverOut: (() => void) | undefined

  constructor(props: ClickableProps) {
    super();
    this.width = props.width;
    this.height = props.height;
    this.active = props.active;
    this.click = props.click;
    this.hoverOver = props.hoverOver;
    this.hoverOut = props.hoverOut;
  }
}
