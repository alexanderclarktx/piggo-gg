import { World, Component, InvokedAction } from "@piggo-gg/core";

export type Bounds = { x: number, y: number, w: number, h: number };

export type ClickableProps = {
  width: number
  height: number
  active: boolean
  anchor?: { x: number, y: number }
  click?: (_: { world: World }) => InvokedAction
  hoverOver?: () => void
  hoverOut?: () => void
}

export class Clickable extends Component<"clickable"> {
  type: "clickable" = "clickable"
  width: number
  height: number
  active: boolean
  anchor: { x: number, y: number }
  click: ((_: { world: World }) => InvokedAction) | undefined
  hoverOver: (() => void) | undefined
  hoverOut: (() => void) | undefined

  constructor(props: ClickableProps) {
    super();
    this.width = props.width;
    this.height = props.height;
    this.active = props.active;
    this.anchor = props.anchor ?? { x: 0, y: 0 };
    this.click = props.click ?? (({world}) => ({ action: "click", playerId: world.client?.playerId }));
    this.hoverOver = props.hoverOver;
    this.hoverOut = props.hoverOut;
  }
}
