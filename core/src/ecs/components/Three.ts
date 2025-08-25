import { Component, World } from "@piggo-gg/core"

export type Three = Component<"three", {}> & {
  init: undefined | ((three: Three, world: World) => Promise<void>)
  cleanup: () => void
}

export type ThreeProps = {
  init?: (three: Three, world: World) => Promise<void>
}

export const Three = (props: ThreeProps = {}): Three => {
  const three: Three = {
    type: "three",
    data: {},
    init: props.init,
    cleanup: () => {

    }
  }
  return three
}
