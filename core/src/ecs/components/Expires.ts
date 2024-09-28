import { Component } from "@piggo-gg/core";

export type Expires = Component<"expires"> & {
  data: {
    ticksLeft: number
  },
  onExpire: () => void
}

export type ExpiresProps = {
  ticksLeft: number
  onExpire?: () => void
}

export const Expires = (props: ExpiresProps): Expires => ({
  type: "expires",
  data: {
    ticksLeft: props.ticksLeft
  },
  onExpire: props.onExpire ?? (() => {})
})
