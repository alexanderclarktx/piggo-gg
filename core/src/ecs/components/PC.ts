import { Component } from "@piggo-gg/core"

export type PC = Component<"pc"> & {
  data: {
    name: string
    ready: boolean
    points: number
  }
}

export const PC = ({ name }: { name: string }): PC => ({
  type: "pc",
  data: {
    name, ready: false, points: 0
  }
})
