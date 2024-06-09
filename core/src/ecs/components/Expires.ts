import { Component } from "@piggo-gg/core";

export type Expires = Component<"expires"> & {
  data: {
    ticksLeft: number
  }
}

export type ExpiresProps = {
  ticksLeft: number
}

export const Expires = (props: ExpiresProps): Expires => ({
  type: "expires",
  data: {
    ticksLeft: props.ticksLeft
  }
})
