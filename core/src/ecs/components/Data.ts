import { Component, NetworkedComponentData } from "@piggo-gg/core";

export type Data = Component<"data", NetworkedComponentData>

export type DataProps = {
  data: NetworkedComponentData
}

export const Data = (props: DataProps): Data => ({
  type: "data",
  data: props.data
})
