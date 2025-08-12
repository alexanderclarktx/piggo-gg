import { CSS } from "@piggo-gg/core"

const defaults: CSS = {
  position: "absolute"
}

export const HtmlDiv = (style: CSS = {}): HTMLDivElement => {
  const div = document.createElement("div")

  Object.assign(div.style, defaults)

  div.oncontextmenu = (e) => e.preventDefault()
  div.ontouchstart = (e) => e.preventDefault()
  div.ontouchend = (e) => e.preventDefault()
  div.ontouchmove = (e) => e.preventDefault()
  div.ontouchcancel = (e) => e.preventDefault()

  Object.assign(div.style, style)

  return div
}

export type RefreshableDiv = { div: HTMLDivElement, update: () => void }
