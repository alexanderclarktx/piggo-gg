import { Component } from "@piggo-gg/core"

export type Food = Component<"food"> & {
  data: {
    hunger: number
  }
}

export type FoodProps = {
  hunger: number
}

export const Food = (props: FoodProps): Food => ({
  type: "food",
  data: {
    hunger: props.hunger
  }
})
