import { Component } from "@piggo-gg/core";

export type ExpiresProps = {
  ticksLeft: number
}

export class Expires extends Component<"expires"> {
  type: "expires" = "expires";

  override data = {
    ticksLeft: 0
  }

  constructor({ ticksLeft }: ExpiresProps) {
    super();
    this.data.ticksLeft = ticksLeft;
  }
}
