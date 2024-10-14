import { Component } from "@piggo-gg/core";

export type Droppable = Component<"droppable"> & {
  dropped: boolean
}

export const Droppable = (dropped: boolean = false): Droppable => ({
  type: "droppable",
  dropped
})
