import { Component } from "@piggo-gg/core";

export type Controlling = Component<"controlling"> & {
  type: "controlling"
  data: {
    entityId: string
  }
}

export type ControllingProps = {
  entityId?: string
}

export const Controlling = (props: ControllingProps): Controlling => ({
  type: "controlling",
  data: {
    entityId: props.entityId ?? ""
  }
})
