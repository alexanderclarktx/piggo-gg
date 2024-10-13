import { Action } from "@piggo-gg/core"

export const Pickup = Action(({entity}) => {
  console.log(`pickup ${entity?.id}`)
})
