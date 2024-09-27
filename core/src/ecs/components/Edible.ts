import { Component } from "@piggo-gg/core"

export type Edible = Component<"edible"> & {
  data: {
    hunger: number
  }
}

export type EdibleProps = {
  hunger: number
}

export const Edible = (props: EdibleProps): Edible => ({
  type: "edible",
  data: {
    hunger: props.hunger
  }
})
