import { Component } from "@piggo-gg/core";

export type ElementKinds = "wood" | "rock" | "flesh"

export type Element = Component<"element", { kind: ElementKinds }>

export const Element = (kind: ElementKinds): Element => ({
  type: "element",
  data: { kind }
})
