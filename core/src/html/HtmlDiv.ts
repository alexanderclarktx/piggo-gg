import { CSS } from "@piggo-gg/core"

const defaults: CSS = {
  position: "absolute",
  border: "2px solid white",
  scrollbarWidth: "none"
}

export type HtmlDiv = HTMLDivElement

export const HtmlDiv = (style: CSS = {}): HtmlDiv => {
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

export type RefreshableDiv = { div: HtmlDiv, update: () => void }
