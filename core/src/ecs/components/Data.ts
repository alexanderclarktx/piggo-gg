import { Component, NetworkedComponentData } from "@piggo-gg/core"

export type Data = Component<"data", NetworkedComponentData> & {
  set(key: string, value: any): void
}

export type DataProps = {
  data: NetworkedComponentData
}

export const Data = (props: DataProps): Data => ({
  type: "data",
  data: props.data,
  set(key: string, value: any) {
    this.data[key] = value
  }
})
