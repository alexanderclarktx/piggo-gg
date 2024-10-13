import { World, Component, InvokedAction, XY } from "@piggo-gg/core";

export type Bounds = { x: number, y: number, w: number, h: number };

export type Clickable = Component<"clickable"> & {
  type: "clickable"
  width: number
  height: number
  active: boolean
  anchor: XY
  click?: (_: { world: World }) => InvokedAction
  hoverOver?: ((world: World) => void) | undefined
  hoverOut?: ((world: World) => void) | undefined
}

export type ClickableProps = {
  width: number
  height: number
  active: boolean
  anchor?: XY
  click?: (_: { world: World }) => InvokedAction
  hoverOver?: (world: World) => void
  hoverOut?: (world: World) => void
}

export const Clickable = (props: ClickableProps): Clickable => {
  return {
    type: "clickable",
    width: props.width,
    height: props.height,
    active: props.active,
    anchor: props.anchor ?? { x: 0, y: 0 },
    click: props.click ?? (({ world }) => ({ action: "click", playerId: world.client?.playerId() })),
    hoverOver: props.hoverOver,
    hoverOut: props.hoverOut
  }
}
