import { Component } from "@piggo-gg/core"

export type PC = Component<"pc"> & {
  data: {
    leader: boolean
    name: string
    points: number
    ready: boolean
  }
}

export const PC = ({ name }: { name: string }): PC => ({
  type: "pc",
  data: {
    leader: false,
    name,
    points: 0,
    ready: false
  }
})
