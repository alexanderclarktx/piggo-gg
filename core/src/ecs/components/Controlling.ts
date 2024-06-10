import { Component } from "@piggo-gg/core";

export type Controlling = Component<"controlling", { entityId: string }> & {
  type: "controlling"
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
