import { Component } from "@piggo-gg/core"

export type Networked = Component<"networked"> & {
  isNetworked: boolean
}

export type NetworkedProps = {
  isNetworked: boolean
}

export const Networked = ({ isNetworked }: NetworkedProps): Networked => ({
  type: "networked",
  isNetworked
})
